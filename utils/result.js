const {
  CODE_SUCCESS,
  CODE_ERROR
} = require('./config')

class Result {
  constructor(data, msg, options) {
    this.data = null
    if (arguments.length === 0) {
      this.msg = 'Operation successful!'
    } else if (arguments.length === 1) {
      this.data = data
    } else {
      this.data = data
      this.msg = msg
      if (options) this.options = options
    }
  }

  content() {
    if (!this.code) {
      this.code = CODE_SUCCESS
    }

    let base = {
      code: this.code,
      message: this.msg || 'Operation successful!'
    }

    if (this.data) {
      base.content = this.data
    }

    if (this.options) {
      base.options = this.options
    }

    return base
  }

  success(res) {
    this.code = CODE_SUCCESS
    this.send(res)
  }

  fail(res) {
    this.code = CODE_ERROR
    this.send(res)
  }

  send(res) {
    res.send(this.content())
  }
}

module.exports = Result
