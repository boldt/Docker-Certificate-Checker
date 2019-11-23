# Docker Certificate Checker

This docker container checks the validation of certificates for a list of domains.
It can send an email, when they expire at specific days/hours.
It is written in **Node.js**.

* Docker Hub: https://hub.docker.com/repository/docker/boldt/certchecker
* Github: https://github.com/boldt/Docker-Certificate-Checker

## Run

```bash
docker run --rm -e DEBUG=1 boldt/certchecker:1.0.0
```

This container contains the following `config.js`:

```js
var Config = {
  domains: [
    'google.com',
    'facebook.com',
    'twitter.com'
  ],
  alert : {
    hours: [1, 6, 12],
    days: [1, 7, 14, 21]
  },
  reporttypes: ['console']
};

module.exports = Config;
```

* It checks the given domains.
* It sends alerts to the console at specific hours/days
* We added `DEBUG=1`, so we see the result for all configured domains immediatly, not only at the specific hours/days.

The result should look similar to the following (ordered by hours):

```
google.com expires in 1580 hours / 65 days
facebook.com expires in 1753 hours / 73 days
twitter.com expires in 3121 hours / 130 days
```

## Configuration

The container can be configured with a JavaScript-object.

```bash
docker run --rm -e DEBUG=1 -v /path/to/config.js:/app/config.js boldt/certchecker:1.0.0
```

The following provides an exhaustive example:

```js
var Config = {
  domains: [ // List of domains to be checked
    'domainA.com',
    'domainB.com',
    'domainC.com'
  ],
  alert : { // When do you want to be alerted?
    hours: [1, 6, 12],
    days: [1, 7, 14, 21]
  },
  reporttypes: ['console', 'mail'], // You can be reported by console or by mail
  nodemailer : { // We use nodemailer, thus use a vaild nodemailer 
    host: "mail.domain.con",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'mail@domain.com', // user
      pass: 'password' // password
    }
  },
  mailOptions : {
    from: 'mail@domain.com', // sender address
    to: ['mail@domain.com'], // list of receivers
    subject: 'Certificates are going to expire!'
  }
};

module.exports = Config;
```

# Add a cronjob

Run the docker command hourly:

```
0 * * * * docker run --rm -e -v /path/to/config.js:/app/config.js DEBUG=1 boldt/certchecker:1.0.0
```

# Build and push

```bash
docker build --no-cache -t boldt/certchecker:1.0.0 .
docker push boldt/certchecker:1.0.0
```
