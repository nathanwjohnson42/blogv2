import React from 'react'
import PropTypes from 'prop-types'
import { Button, GridList, Typography, TextField, withStyles } from 'material-ui'
import io from 'socket.io-client'
import axios from 'axios'
import ReactQuill from 'react-quill'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import createDOMPurify from 'dompurify'
import '../../../node_modules/react-quill/dist/quill.snow.css'
import { subscribeToTimer, unsubscribeFromTimer } from './timer'

const socket = io(),
  DOMPurify = createDOMPurify(window)

class Discussion extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    modules: PropTypes.object.isRequired,
    formats: PropTypes.array.isRequired,
  }
  constructor() {
    super()
    this.state = {
      chat: [
        {
          messages: [],
          connected: true,
        },
      ],
      name: '',
      message: '',
      history: [],
      timestamp: 'no timestamp',
    }
  }

  componentDidMount = () => {
    this.getMessages()
    subscribeToTimer((err, timestamp) => this.setState({
      timestamp,
    }))
    socket.on('generate response', (data) => {
      let chatArr = this.state.chat
      chatArr[0].messages.push({
        message: data.message,
        name: data.name,
        time: data.time,
      })
      this.setState({ chat: chatArr })
    })
  }

  componentWillUnmount = () => {
    unsubscribeFromTimer()
  }

  getMessages = () => {
    axios.get('/api/getMsg')
      .then((res) => {
        this.setState({
          history: res.data,
        })
      })
      .catch((err) => {
        console.log(err)
      })
  }

  gotoBottom = () => {
    let element = document.getElementById('list');
    element.scrollTop = element.scrollHeight - element.clientHeight;
  }

  sendMessage = async () => {
    if (this.state.message.length > 0 && this.state.message !== '<p><br></p>') {
      socket.emit('send message', {
        name: this.state.name,
        message: this.state.message,
        time: this.state.timestamp,
      })
      await axios.post('/api/sendmsg', {
        body: this.state.message,
        name: this.state.name,
        date: this.state.timestamp,
      }).then(() => {
      }).catch((err) => {
        console.log(err)
      })
      this.setState({ message: '' })
      this.gotoBottom()
    }
  }

  changeMessage = (value) => {
    this.setState({ message: value })
  }

  changeName = (e) => {
    this.setState({ name: e.target.value })
  }

  render() {
    const { classes, modules, formats } = this.props
    const {
      name,
      message,
      timestamp,
      chat,
      history,
    } = this.state
    const chatHistory = history.map(message => (
      <div key={message.id}>
        <section className={classes.bubble}>
          <Typography
            className={classes.message}
            component="p"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.message_body) }}
          />
        </section>
        <Typography
          align="right"
          className={classes.time}
          component="b"
        >
          {message.author_name ? message.author_name : 'Anonymous'}
        </Typography>
        <Typography
          align="right"
          className={classes.time}
          component="em"
        >
          {message.message_date}
        </Typography>
      </div>
    ))
    const chatRoom = chat.map(body => (
      body.messages.map((message, index) => (
        <div key={index}>
          <section className={classes.bubble}>
            <Typography
              className={classes.message}
              component="p"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.message) }}
            />
          </section>
          <Typography
            align="right"
            className={classes.time}
            component="b"
          >
            {message.name ? `${message.name}(me)` : 'Anonymous'}
          </Typography>
          <Typography
            align="right"
            className={classes.time}
            component="em"
          >
            {message.time}
          </Typography>
        </div>
      ))
    ))
    return (
      <div className={classes.root}>
        <GridList cols={1} cellHeight="auto" className={classes.gridList} key={0} id="list">
          {chatHistory}
          {chatRoom}
        </GridList>
        <div className="">
          <TextField
            type="text"
            placeholder="Type name"
            onChange={this.changeName}
            value={name}
          />
          <ReactQuill
            value={message}
            modules={modules}
            formats={formats}
            placeholder="start typing..."
            onChange={this.changeMessage}
          />
          <Button
            variant="raised"
            color="primary"
            disabled={!message || message === '<p><br></p>'}
            onClick={this.sendMessage}
          >
          Send Message
          </Button>
          <Button
            variant="raised"
            className={classes.button}
            onClick={this.gotoBottom}
          >
          Go to newest
          </Button>
        </div>
        <p className={classes.time}>
          {timestamp}
        </p>
      </div>
    );
  }
}
const styles = {
  root: {
    width: '80%',
    position: 'relative',
    margin: 'auto',
    top: '5vh',
    background: 'white',
    overflowWrap: 'break-word',
    boxShadow: '5px 10px 18px grey',
    borderRadius: '.4em',
  },
  time: {
    fontSize: 14,
    color: 'grey',
    margin: 0,
  },
  gridList: {
    width: '100%',
    height: 320,
  },
  bubble: {
    position: 'relative',
    background: '#00aabb',
    borderRadius: '.4em',
    margin: '0 5px 0 5px',
  },
  container: {
    background: 'white',
  },
  button: {
    float: 'right',
  },
  message: {
    marginLeft: '30px',
    padding: '10px',
  },
}

const mapStateToProps = state => ({
  modules: state.blogReducer.modules,
  formats: state.blogReducer.formats,
})

export default connect(mapStateToProps)(withStyles(styles)(withRouter(Discussion)))