import React, { Component } from 'react'
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Image,
  NetInfo,
  FlatList,
  ToastAndroid,
  TouchableOpacity,
  BackHandler,
  Dimensions
} from 'react-native'

import { bookAPI } from '../rvAPI'
import { CustomImageButton } from './Button'
import { connect } from 'react-redux'
import { changeVocabListCoverUrl } from './../Action/Action'

class SearchCoverImageScene extends Component {
  constructor (props) {
    super(props)

    let { height, width } = Dimensions.get('window')
    
    this.deviceHeight = height

    this.state = {
      searchInfo: this.props.navigation.state.params.information,
      fetchData: false,
      ds: [],
      deviceWidth: width,
      isShowImage: false
    }

    this._searchCoverImageSceneBackPressHandler = this._searchCoverImageSceneBackPressHandler.bind(this)
    this._netStateChangeHandler = this._netStateChangeHandler.bind(this)
    this._checkDeviceWidth = this._checkDeviceWidth.bind(this)
  }
  
  static navigationOptions = {
    header: null
  }

  componentWillMount () {
    NetInfo.fetch().done((netConnetInfo) => {
      this.setState({
        isShowImage: netConnetInfo === 'WIFI'
      })
    })
  }

  componentDidMount () {
    // android后退键设置
    BackHandler.addEventListener('searchCoverImageScene', this._searchCoverImageSceneBackPressHandler)
    // 探听网络状态
    NetInfo.addEventListener('change', this._netStateChangeHandler)
  }

  componentWillUnmount () {
    BackHandler.removeEventListener('searchCoverImageScene', this._searchCoverImageSceneBackPressHandler)
    NetInfo.removeEventListener('change', this._netStateChangeHandler)
  }

  render () {
    return (
      <View onLayout = {this._checkDeviceWidth}>
        <View style={styles.topBar}>
          <CustomImageButton
            source={{uri: 'ic_arrow_back_white_36dp'}}
            onPress={this._cancel.bind(this)}
            style={styles.imageButton}
          />
          <TextInput
            style = {styles.searchPanel}
            ref = {(textInput) => { this.textInput = textInput }}
            onChangeText = {(searchInfo) => this.setState({searchInfo})}
            value = {this.state.searchInfo}
            underlineColorAndroid = 'white'
            inlineImageLeft = 'ic_search_white_36dp'
            inlineImagePadding = {5}
            onSubmitEditing = {this._search.bind(this, this.state.searchInfo)}
            autoFocus = {true}
            disableFullscreenUI = {true}
            returnKeyType = {'search'}
          />
        </View>
        {
          this.state.fetchData ? (
            <Text style={styles.loadingText}>{'加载中...'}</Text>
          ) : (
            <FlatList
              data = {this.state.ds}
              renderItem = { this.state.isShowImage ? ({item}) => (
                <TouchableOpacity onPress = {this._changeCoverUrl.bind(this, item.id, this.props.navigation.state.params.information)}>
                  <View>
                    <Image source = {{uri: item.image}} style = {styles.coverImageSize}/>
                  </View>
                </TouchableOpacity>
              ) : ({item}) => (
                <TouchableOpacity onPress = {this._changeCoverUrl.bind(this, item.id, this.props.navigation.state.params.information)}>
                  <View style={item.title === undefined ? {} : {
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderColor: '#90CAF9'
                  }}>
                    <Text style={styles.bookTitle}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor = {(item) => item.id}
              key = {(this.state.isShowImage ? (this.deviceHeight > this.state.deviceWidth ? 'vShow' : 'hShow') : 'hide')}
              numColumns = {this.state.isShowImage ? Math.floor(this.state.deviceWidth / 90) : 1}
              columnWrapperStyle = {this.state.isShowImage && {justifyContent: 'space-around', marginVertical: 5}}
              // FlatList最后一栏不能完全显示
              style = {{marginBottom: 60}}
            />
          )
        }
      </View>
    )
  }

  _cancel () {
    this.props.navigation.goBack()
  }

  _search (bookInfo) {
    this.setState({fetchData: true})

    bookAPI.getBookID(bookInfo, 100).then((marchBooks) => {
      if (marchBooks.count > 0) {
        // ToastAndroid.show(JSON.stringify(marchBooks.books), ToastAndroid.LONG)
        this.setState({
          fetchData: false,
          ds: marchBooks.books
        })
      } else {
        throw Error('在豆瓣中没找到' + bookInfo + '相关内容，请换一个关键词')
      }
    }).catch((e) => {
      ToastAndroid.show('' + e, ToastAndroid.LONG)
      this.setState({
        fetchData: false,
        ds: []
      })
    })
  }

  _changeCoverUrl (doubanBookID, vocabListName) {
    this.setState({
      fetchData: true
    })

    this.props.changeVocabListCoverUrl(doubanBookID, vocabListName).then(() => {
      this._cancel()
    }).catch((e) => {
      ToastAndroid.show('' + e, ToastAndroid.SHORT)
      this.setState({
        fetchData: false
      })
    })
  }

  _searchCoverImageSceneBackPressHandler () {
    let currentRoute = this.props.navigation.state.routeName
    if (currentRoute === 'SearchCoverImageScene') {
      this._cancel()
      return true
    }
  }

  _netStateChangeHandler (newNetStateInfo) {
    this.setState({
      isShowImage: newNetStateInfo === 'WIFI'
    })
  }

  _checkDeviceWidth ({nativeEvent: {layout: { width}}}) {
    // ToastAndroid.show('width: ' + e.nativeEvent.layout.width, ToastAndroid.SHORT)
    this.setState({
      deviceWidth: width,
    })
  }
}

const styles = StyleSheet.create({
  searchPanel: {
    fontSize: 22,
    flex: 1,
    color: 'white'
  },
  coverImageSize: {
    width: 80,
    height: 118
  },
  bookTitle: {
    fontSize: 20,
    paddingLeft: 16,
    textAlignVertical: 'center'
  },
  imageButton: {
    height: 36,
    width: 36,
    marginRight: 10,
    marginLeft: 5
  },
  topBar: {
    flex: 0,
    height: 56,
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 22,
    textAlign: 'center',
    marginTop: 30
  }
})

var mapDispatchToProps = (dispatch) => {
  return {
    changeVocabListCoverUrl: (id, vocabListName) => dispatch(changeVocabListCoverUrl(id, vocabListName))
  }
}

export default connect(null, mapDispatchToProps)(SearchCoverImageScene)
