// const utils = require('/opt/utils')

const token = process.env["API_TOKEN"];
const apiRoot = process.env["API_ROOT"];

async function getNarmiUsers() {
  // const apiSecret = await utils.decryptEnvironmentVar("API_SECRET");
  // const requestHeaders = utils.generateSignedRequestHeaders(token, apiSecret)
  //
  // const usersResponse = await fetch(`${apiRoot}/v1/users`, {
  //   headers: requestHeaders,
  //   method: "GET",
  // });
  //
  // if (!usersResponse.ok) {
  //   console.error("Encountered a Narmi API error", await usersResponse.text());
  //   return {
  //     statusCode: 503,
  //     body: "Encountered an error from the Narmi API.",
  //   };
  // }
  // const userData = await usersResponse.json();
  // return userData;
  return ( 
    [
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
    {
      email: 'velma@example.com',
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
      last_login: '2020-06-11 19:16:05.695000+00:00',
      segment: '',
      metadata: {},
      has_username: true,
      has_password: true,
      has_accepted_latest_terms: true,
      requires_enrollment_code_verification: false
    },
    {
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
      last_login: '2023-03-28 14:19:10.671559+00:00',
      segment: '',
      metadata: {},
      has_username: true,
      has_password: true,
      has_accepted_latest_terms: true,
      requires_enrollment_code_verification: false
    },
    {
      email: 'demo@narmitech.com',
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
      last_login: '2023-03-28 14:19:10.671559+00:00',
      segment: '',
      metadata: {},
      has_username: true,
      has_password: true,
      has_accepted_latest_terms: true,
      requires_enrollment_code_verification: false
    }
  ])
}

exports.handler = async (event) => {
  await main();
};

// TODO: make these env vars in the function
const DAYS_TO_NOTIFY = 30;
const DAYS_TO_DEACTIVATE = 90;

async function main() {
  const today = new Date();

  const priorDateToNotify = new Date(new Date().setDate(today.getDate() - DAYS_TO_NOTIFY));
  const priorDateToNotifyStart = new Date(new Date().setDate(today.getDate() - DAYS_TO_NOTIFY - 7));
  const priorDateToDeactivate = new Date(new Date().setDate(today.getDate() - DAYS_TO_DEACTIVATE));
  const priorDateToDeactivateStart = new Date(new Date().setDate(today.getDate() - DAYS_TO_DEACTIVATE - 7));

  const users = await getNarmiUsers()

  // const users_to_deactivate = users.filter(user => Date.parse(user.last_login) < priorDateToDeactivate )
  
  const users_to_notify = users.filter(user => {
    return priorDateToNotifyStart < Date.parse(user.last_login) && Date.parse(user.last_login) <= priorDateToNotify 
  })

  notify_users(users_to_notify);
}

async function notify_users(users_list) {
  //console.log(users_list);
  users_list.forEach((user) => {
    console.log(user.username, "last logged in", user.last_login);
    console.log("send email to",user.email);
  })
  const mailchimpKey = await utils.decryptEnvironmentVar("MAILCHIMP_API_KEY");
  const mailchimpResponse = await fetch(
    `https://${process.env["MAILCHIMP_SERVER"]}.api.mailchimp.com/3.0/lists/${LIST_ID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mailchimpKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        members: [
          {
            email_address: userData.user.email,
            status: "subscribed",
          },
        ],
      }),
    }
  );
  if (!mailchimpResponse.ok) {
    console.error("Encountered a mailchimp error", await mailchimpResponse.text());
    return {
      statusCode: 503,
      body: "Encountered an error attempting to send message.",
    };
  }
  return {
    statusCode: 200,
    body: "User added successfully.",
  };
}

main();
