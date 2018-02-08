// import axios from 'axios'

const initialState = {
  title: '',
  body: '',
  modules: {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
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

const CHANGE_BODY = 'CHANGE_BODY',
  CHANGE_TITLE = 'CHANGE_TITLE'

export const changeBody = value => ({
  type: CHANGE_BODY,
  payload: value,
})

export const changeTitle = e => ({
  type: CHANGE_TITLE,
  payload: e.target.value,
})

export default function reducer(state = initialState, action) {
  const { payload, type } = action
  switch (type) {
    case CHANGE_BODY:
      return { ...state, body: payload }
    case CHANGE_TITLE:
      return { ...state, title: payload }
    default:
      return state
  }
}