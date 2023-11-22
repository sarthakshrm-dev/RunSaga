const SibApiV3Sdk = require("sib-api-v3-sdk");
const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendRegisterEmail = async (email, otp) => {
  const sendSmtpEmail = {
    to: [
      {
        email,
      },
    ],
    templateId: 2,
    params: {
      otp,
    },
    headers: {
      "X-Mailin-custom":
        "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
    },
  };
  await brevoEmail(sendSmtpEmail);
};

const sendForgotPasswordEmail = async (email, otp) => {
  const sendSmtpEmail = {
    to: [
      {
        email,
      },
    ],
    templateId: 2,
    params: {
      otp,
    },
    headers: {
      "X-Mailin-custom":
        "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
    },
  };
  await brevoEmail(sendSmtpEmail);
};

const sendResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/${token}`;
  const sendSmtpEmail = {
    to: [
      {
        email,
      },
    ],
    templateId: 3,
    params: {
      url:resetUrl,
    },
    headers: {
      "X-Mailin-custom":
        "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
    },
  };
  await brevoEmail(sendSmtpEmail);
  return resetUrl;
};

const brevoEmail = (mailOptions) => {
  apiInstance
    .sendTransacEmail(mailOptions)
    .then((data) => {
      console.log("API called successfully. Returned data:", data);
      return data;
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
  sendRegisterEmail,
  sendResetEmail,
  sendForgotPasswordEmail
};
