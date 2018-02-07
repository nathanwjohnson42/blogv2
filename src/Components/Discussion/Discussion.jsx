import React from 'react'
import PropTypes from 'prop-types'
import { Button, GridList, Typography, TextField, withStyles } from 'material-ui'
import io from 'socket.io-client'
import axios from 'axios'
import ReactQuill from 'react-quill'
import '../../../node_modules/react-quill/dist/quill.snow.css'
import subscribeToTimer from './api'

const socket = io(),
  createDOMPurify = require('dompurify'),
  DOMPurify = createDOMPurify(window)

class Discussion extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
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
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['link', 'image'],
          ['clean'],
        ],
      },
      formats: [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image',
      ],
    }

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

  componentWillMount = () => {
    this.getMessages()
  }

  getMessages = () => {
    axios.get('/api/getMsg')
      .then((res) => {
        this.setState({
          history: res.data,
        })
        console.log(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }
  gotoBottom = () => {
    let element = document.getElementById('list');
    element.scrollTop = element.scrollHeight - element.clientHeight;
  }
  sendMessage = () => {
    if (this.state.message.length > 0 && this.state.message !== '<p><br></p>') {
      socket.emit('send message', {
        name: this.state.name,
        message: this.state.message,
        time: this.state.timestamp,
      })
      axios.post('/api/sendmsg', {
        body: this.state.message,
        name: this.state.name,
        date: this.state.timestamp,
      }).then((res) => {
      }).catch((err) => {
      })
      this.setState({ message: '<p><br></p>' })
      this.gotoBottom()
    } else if (this.state.message.toString() === '<p><br></p>') {
      this.setState({ message: '' })
    }
  }
  changeMessage = (value) => {
    this.setState({ message: value })
  }
  changeName = (e) => {
    this.setState({ name: e.target.value })
  }
  render() {
    const {
      classes,
    } = this.props
    const {
      name,
      message,
      timestamp,
      chat,
      history,
      formats,
      modules,
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
            {message.name ? `${message.name}(me)` : 'Anonymous Me'}
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

const styles = theme => ({
  root: {
    width: '80%',
    position: 'relative',
    margin: 'auto',
    top: '5vh',
    background: 'white',
  },
  time: {
    marginBottom: 16,
    fontSize: 14,
    color: theme.palette.text.secondary,
  },
  gridList: {
    width: '100%',
    height: 350,
  },
  bubble: {
    position: 'relative',
    background: '#00aabb',
    borderRadius: '.4em',
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
)
export default withStyles(styles)(Discussion)