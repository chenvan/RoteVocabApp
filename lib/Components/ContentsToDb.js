import React, { Component } from 'react'
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Alert,
  ToastAndroid
} from 'react-native'

import { CustomTextButton } from './Button'
import { connect } from 'react-redux'
import { addVocabListToCollection, addVocabListToCollectionFromJSON } from './../Action/Action'

class ContentsToDb extends Component {
  constructor (props) {
    super(props)

    let modelName
    let fileExtension
    let dotPosition = this.props.filename.lastIndexOf('.')
    if (dotPosition !== -1) {
      modelName = this.props.filename.slice(0, dotPosition)
      fileExtension = this.props.filename.slice(dotPosition + 1)
    } else {
      modelName = this.props.filename
      fileExtension = 'txt'
    }

    this.state = {
      modelName,
      fileExtension,
      importing: false
    }
  }

  render () {
    return (
      this.state.importing ? (
        <Text style={styles.loadingTxt}>{'加载中...'}</Text>
      ) : (
        <View style = {this.props.style && this.props.style}>
          <Text style={{fontSize: 20, margin: 5}}>为这次导入的单词集取个名字</Text>
          <TextInput
              style={{fontSize: 20, lineHeight: 40}}
              autoFocus={true}
              onChangeText={(text) => this.setState({modelName: text})}
              value={this.state.modelName}
          />
          <View style={styles.buttonZone}>
            <CustomTextButton
              style = {styles.textButton}
              text = {'确认'}
              onPress = {this._store.bind(this, this.props.contents)}
            />
            <CustomTextButton
              style = {styles.textButton}
              text = {'取消'}
              onPress = {this.props.exit}
            />
          </View>
        </View>
      )
    )
  }

  _store (contents) {
    if (this.state.modelName.length === 0) {
      Alert.alert(
        '',
        '不能没有名字',
        [
          {text: '确认', onPress: () => {}}
        ]
      )
    } else if (this.state.modelName.toLowerCase() === 'setting') {
      Alert.alert(
        '',
        '不能用setting作为词集名字，请换个名字',
        [
          {text: '确认', onPress: () => {}}
        ]
      )
    } else {
      this.setState({
        importing: true
      })

      if (this.state.fileExtension === 'json') {
        let checkProperty = ['bookmark', 'rows', 'totalLength']

        this.props.addVocabListToCollectionFromJSON(this.state.modelName, contents, checkProperty).then(() => {
          this.props.exit()
        }).catch((e) => {
          ToastAndroid.show('' + e, ToastAndroid.SHORT)
          this.setState({
            importing: false
          })
        })
      } else {
        this.props.addVocabListToCollection(this.state.modelName, contents, /^"(.+?)"$/gm).then(() => {
          this.props.exit()
        }).catch((e) => {
          ToastAndroid.show('' + e, ToastAndroid.SHORT)
          this.setState({
            importing: false
          })
        })
      }
    }
  }
}

const styles = StyleSheet.create({
  textButton: {
    fontSize: 21,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: '#2196F3'
  },
  buttonZone: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 15
  },
  loadingTxt: {
    fontSize: 22,
    textAlign: 'center',
    marginTop: 56
  }
})

var mapDispatchToProps = (dispatch) => {
  return {
    addVocabListToCollection: (vocabListName, contents, reg) => dispatch(addVocabListToCollection(vocabListName, contents, reg)),
    addVocabListToCollectionFromJSON: (vocabListName, contents, checkProperty) => dispatch(addVocabListToCollectionFromJSON(vocabListName, contents, checkProperty))
  }
}

export default connect(null, mapDispatchToProps)(ContentsToDb)
