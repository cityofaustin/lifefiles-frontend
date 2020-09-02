// TODO: need to hash this out more...

interface APIErrorResponse {
  errors?: any; // sometimes the 500 json response starts with errors
  msg?: any; // sometimes the 500 json response start with msg
}

// interface Error

export default APIErrorResponse;

// Reference errors I've seen
// 500
// {"msg":{"errors":{"username":{"message":"is already taken.","name":"ValidatorError","properties":{"message":"is already taken.","type":"unique","path":"username","value":"carnagey.adam"},"kind":"unique","path":"username","value":"carnagey.adam"},"email":{"message":"is already taken.","name":"ValidatorError","properties":{"message":"is already taken.","type":"unique","path":"email","value":"carnagey.adam@gmail.com"},"kind":"unique","path":"email","value":"carnagey.adam@gmail.com"}},"_message":"Account validation failed","message":"Account validation failed: username: is already taken., email: is already taken.","name":"ValidationError"}}
// 500
// {
//   "errors": {
//     "message": "\"account.email\" is not allowed to be empty",
//       "error": {
//       "joi": {
//         "_original": {
//           "account": {
//             "email": "",
//               "password": ""
//           }
//         },
//         "details": [
//           {
//             "message": "\"account.email\" is not allowed to be empty",
//             "path": [
//               "account",
//               "email"
//             ],
//             "type": "string.empty",
//             "context": {
//               "label": "account.email",
//               "value": "",
//               "key": "email"
//             }
//           }
//         ]
//       },
//       "meta": {
//         "source": "body"
//       }
//     }
//   }
// }
// 422
// {
//     "errors": {
//       "email or password": "is invalid"
//   }
// }
// 401
// {
//   "errors": {
//     "message": "jwt malformed",
//       "error": {
//       "name": "UnauthorizedError",
//         "message": "jwt malformed",
//         "code": "invalid_token",
//         "status": 401,
//         "inner": {
//         "name": "JsonWebTokenError",
//           "message": "jwt malformed"
//       }
//     }
//   }
// }
