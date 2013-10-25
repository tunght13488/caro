Accounts.config({
  sendVerificationEmail: false,
  forbidClientAccountCreation: true,
  restrictCreationByEmailDomain: 'smartosc.com'
});

Accounts.loginServiceConfiguration.remove({
  service: "google"
});

Accounts.loginServiceConfiguration.insert({
  service: "google",
  clientId: "347524109715.apps.googleusercontent.com",
  secret: "_QysGrZ_Jjd8O8NkB3YPyX4v"
});
