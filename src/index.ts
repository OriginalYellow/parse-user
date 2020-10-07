import express, { RequestHandler } from 'express'

// interfaces:
interface ParsedData {
  firstName: String;
  lastName: String;
  clientId: String;
}

// data transforms:
const transformData1 = (data: Array<String>): ParsedData => ({
  firstName: data[0],
  lastName: data[1],
  clientId: data[2]
})

const transformData2 = (data: Array<String>): ParsedData => ({
  firstName: data[0],
  lastName: data[1],
  clientId: `${data[2].slice(0, 3)}-${data[2].slice(3)}`
})

// common handlers:
const checkString: RequestHandler = ({ body }, res, next) => {
  if (typeof body.data !== 'string') {
    res.status(400).send('"data" must be a string')
    return
  }

  next()
}

const parseData = (regexp: RegExp): RequestHandler => ({ body }, res, next) => {
  if (!regexp.flags.includes('g')) {
    throw new Error('regexp must be global')
  }

  const arr = body.data.match(regexp)

  if (arr.length !== 3) {
    res.status(400).send('failed to parse "data"')
    return
  }

  res.locals.data = arr
  next()
}

// create app:
const app = express()
app.use(express.json());

// route-specific handlers:
app.post(
  '/api/v1/parse',
  checkString,
  parseData(/(([a-z]+)000*)|([1-9][0-9]+)/ig),
  (_, res) => res.status(200).send({
    statusCode: 200,
    data: transformData1(res.locals.data)
  }))

app.post(
  '/api/v2/parse',
  checkString,
  parseData(/([a-z]+)|((?!000)[1-9][0-9]+)/ig),
  (_, res) => res.status(200).send({
    statusCode: 200,
    data: transformData2(res.locals.data)
  }))

// start app:
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`))