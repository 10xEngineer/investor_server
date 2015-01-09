var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport("SMTP", {
  service: "Gmail",
  auth: {
    XOAuth2: {
      user: "steve.g.messina@gmail.com", // Your gmail address.
                                            // Not @developer.gserviceaccount.com
      clientId: "1014829492655-pp83vrlnhh8dl4nlmf9n6s6mjldfoqm0.apps.googleusercontent.com",
      clientSecret: "KGtoBR31Udoj3MDTCu5_uLYJ",
      refreshToken: "1/5Il2FP4ui8SqDertQFvsv6qhJqBlO14RUoLVN43hu3o"
    }
  }
});

var mailOptions = {
  from: "passwordreset@ucanpay.io",
  to: "steve.g.messina@gmail.com",
  subject: "Hello, world",
  generateTextFromHTML: true,
  html: "<b>Hello, world</b>"
};

smtpTransport.sendMail(mailOptions, function(error, response) {
  if (error) {
    console.log(error);
  } else {
    console.log(response);
  }
  smtpTransport.close();
});