const utils = require('/opt/utils');

const token = process.env["API_TOKEN"];
const apiRoot = process.env["API_ROOT"];

const fromEmail = process.env["FROM_EMAIL"];

const initialNoticeDays = process.env["INITIAL_NOTICE_DAYS"];
const finalNoticeDays = process.env["FINAL_NOTICE_DAYS"];
const deactivationDays = process.env["DEACTIVATION_DAYS"];

const initialNoticeTemplateName = process.env["INITIAL_NOTICE_TEMPLATE_NAME"];
const finalNoticeTemplateName = process.env["FINAL_NOTICE_TEMPLATE_NAME"];
const deactivationTemplateName = process.env["DEACTIVATION_TEMPLATE_NAME"];

const useDummyData = true;

async function getNarmiUsers() {
  if (useDummyData) {
    return dummyData;
  }
  const apiSecret = await utils.decryptEnvironmentVar("API_SECRET");
  const requestHeaders = utils.generateSignedRequestHeaders(token, apiSecret)
  
  const usersResponse = await fetch(`${apiRoot}/v1/users`, {
    headers: requestHeaders,
    method: "GET",
  });
  
  if (!usersResponse.ok) {
    console.error("Encountered a Narmi API error", await usersResponse.text());
    return {
      statusCode: 503,
      body: "Encountered an error from the Narmi API.",
    };
  }
  const userData = await usersResponse.json();
  return userData;
}

exports.handler = async (event) => {
  const today = new Date();

  const initialNoticeDate = new Date(new Date().setDate(today.getDate() - initialNoticeDays));
  const initialNoticeDateStart = new Date(new Date().setDate(today.getDate() - initialNoticeDays - 7));

  const finalNoticeDate = new Date(new Date().setDate(today.getDate() - finalNoticeDays));
  const finalNoticeDateStart = new Date(new Date().setDate(today.getDate() - finalNoticeDays - 7));

  const deactivationDate = new Date(new Date().setDate(today.getDate() - deactivationDays));
  const deactivationDateStart = new Date(new Date().setDate(today.getDate() - deactivationDays - 7));

  const users = await getNarmiUsers()

  const users_active = users.filter(user => user.is_active == true);
  
  const initialNoticeUsers = users_active.filter(user => {
    return initialNoticeDateStart < Date.parse(user.last_login) && Date.parse(user.last_login) <= initialNoticeDate 
  })
  const finalNoticeUsers = users_active.filter(user => {
    return finalNoticeDateStart < Date.parse(user.last_login) && Date.parse(user.last_login) <= finalNoticeDate 
  })
  const usersToDeactivate = users_active.filter(user => {
    return deactivationDateStart < Date.parse(user.last_login) && Date.parse(user.last_login) <= deactivationDate 
  })

  await notifyUsers(initialNoticeUsers, initialNoticeTemplateName);
  // TODO: add these email templates
  await notifyUsers(finalNoticeUsers, finalNoticeTemplateName);
  await notifyUsers(usersToDeactivate, deactivationTemplateName);

  await deactivateUsers(usersToDeactivate);
}

async function notifyUsers(usersList, templateName) {
  const mailchimpKey = await utils.decryptEnvironmentVar("MAILCHIMP_API_KEY");

  for (const user of usersList) {
    console.log("\n",user.username, "last logged in", user.last_login);
    console.log("\n--> send email to",user.email);

    const emailData = {
      key: mailchimpKey,
      template_name: templateName,
      template_content: [],
      message: {
        from_email: fromEmail,
        to: [{email: user.email}],
      }
    };

    const res = await fetch("https://mandrillapp.com/api/1.0/messages/send-template", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData), 
    });
    if(!res.ok){
      console.log("an error occurred when trying to send email via mailchimp api");
    }
  }

}

async function deactivateUsers(usersList) {
  console.log("deactivating users");

  console.log("\nusers to deactivate:", usersList);
  return;

  const apiSecret = await utils.decryptEnvironmentVar("API_SECRET");
  const requestHeaders = utils.generateSignedRequestHeaders(token, apiSecret)
  
  for (const user of usersList) {
    const usersResponse = await fetch(`${apiRoot}/v1/users/${user.id}/is_active`, {
      headers: requestHeaders,
      method: "POST",
      body: JSON.stringify({is_active: false}),
    });
    if (!usersResponse.ok) {
      console.error("Encountered a Narmi API error", await usersResponse.text());
      return {
        statusCode: 503,
        body: "Encountered an error from the Narmi API.",
      };
    }
  }
  
}

const dummyData = [
      {
      email: 'fred@example.com',
      username: 'testvieweruser',
      id: '36ad2910-ed30-40f4-8304-32222892aae0',
      institution_user_identifier: '43337',
      updated_at: '2018-11-02 03:29:18.317000+00:00',
      addresses: [Array],
      phone_numbers: [Array],
      first_name: 'Fred',
      last_name: 'Jones',
      paper_statements: true,
      user_category: 'business',
      features: [Object],
      org_uuid: 'd49ac8b0-8ed6-4777-a338-b6c9ea6a277c',
      org_role: 'Viewer',
      org_name: 'narmi',
      business_permissions: [Array],
      dual_approval_required: true,
      is_staff: false,
      is_active: true,
      is_superuser: false,
      date_joined: '2018-03-26 14:43:59.004000+00:00',
      last_login: '2020-06-11 19:16:05.695000+00:00',
      segment: '',
      metadata: {},
      has_username: true,
      has_password: true,
      has_accepted_latest_terms: true,
      requires_enrollment_code_verification: false
    },
    { // user has not logged in in 128 days
      email: 'trent@narmi.com',
      username: 'testcollabuser',
      id: 'ce3458d6-227a-4924-835c-c8fbbd79bae5',
      institution_user_identifier: '43337',
      updated_at: '2018-11-02 03:29:18.317000+00:00',
      addresses: [Array],
      phone_numbers: [Array],
      first_name: 'Velma',
      last_name: 'Dinkley',
      paper_statements: true,
      user_category: 'business',
      features: [Object],
      org_uuid: 'd49ac8b0-8ed6-4777-a338-b6c9ea6a277c',
      org_role: 'Collaborator',
      org_name: 'narmi',
      business_permissions: [Array],
      dual_approval_required: true,
      is_staff: false,
      is_active: true,
      is_superuser: false,
      date_joined: '2018-03-26 14:43:59.004000+00:00',
      last_login: '2022-12-21 19:16:05.695000+00:00',
      segment: '',
      metadata: {},
      has_username: true,
      has_password: true,
      has_accepted_latest_terms: true,
      requires_enrollment_code_verification: false
    },
    { // user not logged in 120 days
      email: 'trent@narmi.com',
      username: 'testbusinessuser',
      id: '8b8c584a-d8d1-443a-a2c0-7212fb72af09',
      institution_user_identifier: '43337',
      updated_at: '2018-11-02 03:29:18.317000+00:00',
      addresses: [Array],
      phone_numbers: [Array],
      first_name: 'Shaggy',
      last_name: 'Rogers',
      paper_statements: true,
      user_category: 'business',
      features: [Object],
      org_uuid: 'd49ac8b0-8ed6-4777-a338-b6c9ea6a277c',
      org_role: 'Account Holder',
      org_name: 'narmi',
      business_permissions: [Array],
      dual_approval_required: true,
      is_staff: false,
      is_active: true,
      is_superuser: false,
      date_joined: '2018-03-26 14:43:59.004000+00:00',
      last_login: '2022-12-27 14:19:10.671559+00:00',
      segment: '',
      metadata: {},
      has_username: true,
      has_password: true,
      has_accepted_latest_terms: true,
      requires_enrollment_code_verification: false
    },
    { // user not logged in 90 days
      email: 'trent@narmi.com',
      username: 'testuser',
      id: '07231f46-23f1-482e-bdc4-35f2267b60e6',
      institution_user_identifier: '43333',
      updated_at: '2018-11-02 03:29:18.317000+00:00',
      addresses: [Array],
      phone_numbers: [Array],
      first_name: 'Jane',
      last_name: 'Dough',
      paper_statements: true,
      user_category: 'personal',
      features: [Object],
      org_uuid: null,
      org_role: null,
      org_name: '',
      business_permissions: [],
      dual_approval_required: false,
      is_staff: false,
      is_active: true,
      is_superuser: false,
      date_joined: '2018-03-26 14:43:59.004000+00:00',
      last_login: '2023-01-26 14:19:10.671559+00:00',
      segment: '',
      metadata: {},
      has_username: true,
      has_password: true,
      has_accepted_latest_terms: true,
      requires_enrollment_code_verification: false
    }
  ]

