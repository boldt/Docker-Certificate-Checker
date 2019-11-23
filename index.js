var moment = require('moment');
var nodemailer = require('nodemailer');
var sslCertificate = require('get-ssl-certificate');

var config = require('./config');

// Iterate all domains
var promises = Promise.all(config.domains.map((domain) => {
    // Load cert for given domain. It returns a promise, so it works async
	return sslCertificate.get(domain).then((certificate) => {
        // Determine the "valid to" date
		var date_valid_to = new Date(certificate.valid_to);
		var date_today = new Date();

        // Convert date to moment
		var moment_valid_to = moment(date_valid_to);
		var moment_today = moment(date_today);

        // Calculate the duration between both dates
		var duration = moment.duration(moment_valid_to.diff(moment_today));

        // convert duration to days and hours
		var days = Math.floor(duration.asDays());
        var hours = Math.floor(duration.asHours());

        // Only add the one that match hours or days
        if (process.env.DEBUG || config.alert.hours.includes(hours)) {
          // Match hours
          return {
            domain: domain,
            days: days,
            hours: hours
          };
        } else if (config.alert.days.includes(days) && ((days * 24) == hours)) {
          // Match hours
          return {
            domain: domain,
            days: days,
            hours: hours
          };
        }

        return undefined;
	});
}));

// `promises` contains an array of promises [p1,...,pn]
promises.then((results) => {

  // Filter out undefinded
  results = results.filter(e => (e !== undefined));
  
  if (results.length == 0) {
    console.log('Nothing to do.');
    return;
  }

  // Sort by hours ASC
  results.sort((a, b) => {
    return (a.hours > b.hours) ? 1 : -1;
  });  
  
  // Print report to console
  if(config.reporttypes.includes('console')) {
    results.forEach((result) => {
      // Print each result
      console.log(result.domain + ' expires in ' + result.hours + ' hours / ' + result.days + ' days');
    });
  } // console

  // Send report by mail
  if(config.reporttypes.includes('mail')) {
    // Create SMTP connection
    var transporter = nodemailer.createTransport(config.nodemailer);
    transporter.verify(function(error, success) {
      if (error) {
        console.log(error);
      } else {
        // Server is ready to take our messages

        var html = "";
        // Iterate all results
        results.forEach((result) => {
          // Print each result
          html += "<li>" + result.domain + " expires in " + result.hours + " hours / " + result.days + " days</li>";
        });

        config.mailOptions.html = '<ul>' + html + '</ul>';

        transporter.sendMail(config.mailOptions, function (err, info) {
           if(err){
             console.log(err)
           } else{
             //console.log(info);
             console.log('Mail send to', config.mailOptions.to);
           }
        });      

      }
    });  
  } // mail

});
