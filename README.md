# mypass-frontend

This is a react front end application for the mypass digital identity project

to get started, install node and npm

    npm install

copy .env.local or .env.prod to .env

    npm start

In the browser open http://localhost:3001

    https://circleci.com/orbs/registry/orb/circleci/slack

### ref different errors
500
`{"errors":{"message":"\"account.email\" is not allowed to be empty","error":{"joi":{"_original":{"account":{"email":"","password":""}},"details":[{"message":"\"account.email\" is not allowed to be empty","path":["account","email"],"type":"string.empty","context":{"label":"account.email","value":"","key":"email"}}]},"meta":{"source":"body"}}}}`
422
`{"errors":{"email or password":"is invalid"}}`
401
`{"errors":{"message":"jwt malformed","error":{"name":"UnauthorizedError","message":"jwt malformed","code":"invalid_token","status":401,"inner":{"name":"JsonWebTokenError","message":"jwt malformed"}}}}`
