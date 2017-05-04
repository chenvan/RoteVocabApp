import { rvDB, bookAPI } from '../rvAPI'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import {
  ToastAndroid
} from 'react-native'

const INIT_DATA = 'INIT_DATA'
const RECEIVE_DATA_SUCCESS = 'RECEIVE_DATA_SUCCESS'
const RECEIVE_DATA_FAILURE = 'RECEIVE_DATA_FAILURE'
const CHANGE_COVER_IMAGE_URL = 'CHANGE_COVER_IMAGE_URL'
const ADD_VOCAB_LIST = 'ADD_VOCAB_LIST'
const DELETE_VOCAB_LIST_ARRAY = 'DELETE_VOCAB_LIST_ARRAY'
const CHANGE_VOCOB_LIST_NAME = 'CHANGE_VOCAB_LIST_NAME'

function initData () {
  return {
    type: INIT_DATA
  }
}

function receiveDataSuccess (data) {
  return {
    type: RECEIVE_DATA_SUCCESS,
    data
  }
}

function receiveDataFailure (err) {
  return {
    type: RECEIVE_DATA_FAILURE,
    err
  }
}

function changeCoverImageUrl (vocabListName, coverUrl) {
  return {
    type: CHANGE_COVER_IMAGE_URL,
    vocabListName,
    coverUrl
  }
}

function addVocabList (vocabListName, coverUrl) {
  return {
    type: ADD_VOCAB_LIST,
    vocabListName,
    coverUrl
  }
}

function deleteVocabListArray (vocabListArray) {
  return {
    type: DELETE_VOCAB_LIST_ARRAY,
    vocabListArray
  }
}

function changeVocabListName (vocabListName, nextVocabListName) {
  return {
    type: CHANGE_VOCOB_LIST_NAME,
    vocabListName,
    nextVocabListName
  }
}

function vocabListReducer (state = {init: false, data: {}}, action) {
  let nextData
  switch (action.type) {
    case INIT_DATA:
      return Object.assign({}, state, {init: true})
    case RECEIVE_DATA_SUCCESS:
      return Object.assign({}, state, {init: false, data: action.data})
    case RECEIVE_DATA_FAILURE:
      return Object.assign({}, state, {init: false})
    case CHANGE_COVER_IMAGE_URL:
    case ADD_VOCAB_LIST:
      // deep copy data
      nextData = Object.assign({}, state.data)
      // ToastAndroid.show(JSON.stringify(action),ToastAndroid.SHORT);
      nextData[action.vocabListName] = action.coverUrl
      return Object.assign({}, state, {data: nextData})
    case DELETE_VOCAB_LIST_ARRAY:
      nextData = Object.assign({}, state.data)
      action.vocabListArray.forEach((currentValue) => {
        delete nextData[currentValue]
      })
      return Object.assign({}, state, {data: nextData})
    case CHANGE_VOCOB_LIST_NAME:
      nextData = Object.assign({}, state.data)
      nextData[state.nextVocabListName] = nextData[state.vocabListName]
      delete nextData[state.vocabListArray]
      return Object.assign({}, state, {data: nextData})
    default:
      return state
  }
}

export const configStore = () => {
  return createStore(vocabListReducer, applyMiddleware(thunk))
}

export const initApp = () => {
  return (dispatch) => {
    dispatch(initData())
    return rvDB.getDbNameCollection().then((dbNameCollection) => {
      // ToastAndroid.show(JSON.stringify(dbNameCollection), ToastAndroid.LONG);
      return dispatch(receiveDataSuccess(dbNameCollection))
    }).catch((e) => {
      return dispatch(receiveDataFailure(e))
    })
  }
}

export const changeVocabListCoverUrl = (doubanBookID, vocabListName) => {
  return (dispatch) => {
    // ToastAndroid.show('in dispatch',ToastAndroid.SHORT);
    // dispatch(initData());
    return bookAPI.getBookCoverUrl(doubanBookID).then((url) => {
      if (url === undefined) {
        url = ''
      }
      return rvDB.changeItemBookCoverUrl(vocabListName, url)
    }).then((url) => {
      // ToastAndroid.show(''+url,ToastAndroid.SHORT);
      return dispatch(changeCoverImageUrl(vocabListName, url))
    })
  }
}
// 执行该函数前，应该先检查新名字是否已经被占用了。
export const giveVocabListANewName = (vocabListName, nextVocabListName) => {
  return (dispatch) => {
    // 先修改存储的数据
    return rvDB.giveVocabListANewName(vocabListName, nextVocabListName).then(() => {
      // 然后在执行changeVocabListName
      return dispatch(changeVocabListName(vocabListName, nextVocabListName))
    })
  }
}

export const addVocabListToCollection = (vocabListName, contents, reg) => {
  return (dispatch) => {
    return rvDB.addData(vocabListName, contents, reg).then(([incressRows, url]) => {
      ToastAndroid.show('增加了' + incressRows + '词条', ToastAndroid.SHORT)

      if (url || url === '') {
        return dispatch(addVocabList(vocabListName, url))
      }
    })
  }
}

export const addVocabListToCollectionFromJSON = (vocabListName, contents, checkProperty) => {
  return (dispatch) => {
    return rvDB.addJsonData(vocabListName, contents, checkProperty).then((url) => {
      ToastAndroid.show('JSON文件添加成功', ToastAndroid.SHORT)
      if (url || url === '') {
        // ToastAndroid.show('url is true value', ToastAndroid.SHORT)
        return dispatch(addVocabList(vocabListName, url))
      }
    })
  }
}

export const deleteVocabListFromCollection = (vocabListArray) => {
  return (dispatch) => {
    return rvDB.deleteDataCollection(vocabListArray).then(() => {
      return dispatch(deleteVocabListArray(vocabListArray))
    })
  }
}
