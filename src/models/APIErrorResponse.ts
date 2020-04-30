// TODO: need to hash this out more...

interface APIErrorResponse {
  errors: any;
}

// interface Error

export default APIErrorResponse;

// Reference errors I've seen
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
