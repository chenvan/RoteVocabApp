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
    // 这个正则可能有问题，如果是one.two.json怎么办？
    const file = /([^.]+)\.(\w+)/.exec(this.props.filename)

    this.state = {
      modelName: file[1],
      fileExtension: file[2],
      importing: false
    }
  }

  render () {
    return (
      this.state.importing ? (
        <Text style={{fontSize: 22, textAlign: 'center', marginTop: 56}}>{'加载中...'}</Text>
      ) : (
      <View>
        <Text style={{fontSize: 20, margin: 5}}>为这次导入的单词集取个名字</Text>
        <TextInput
            style={{fontSize: 20, lineHeight: 40}}
            autoFocus={true}
            onChangeText={(text) => this.setState({modelName: text})}
            value={this.state.modelName}
        />
        <View style={{flex: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
          <CustomTextButton
            style = {styles.textButton}
            text = {'确认'}
            onPress = {this._store.bind(this, this.props.contents)}
          />
          <CustomTextButton
            style = {styles.textButton}
            text = {'取消'}
            onPress = {() => { this.props.navigator.pop() }}
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
          this.props.navigator.pop()
        }).catch((e) => {
          ToastAndroid.show('' + e, ToastAndroid.SHORT)
          this.setState({
            importing: false
          })
        })
      } else {
        this.props.addVocabListToCollection(this.state.modelName, contents, /^"(.+?)"$/gm).then(() => {
          this.props.navigator.pop()
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
    margin: 5,
    height: 30
  }
})

var mapDispatchToProps = (dispatch) => {
  return {
    addVocabListToCollection: (vocabListName, contents, reg) => dispatch(addVocabListToCollection(vocabListName, contents, reg)),
    addVocabListToCollectionFromJSON: (vocabListName, contents, checkProperty) => dispatch(addVocabListToCollectionFromJSON(vocabListName, contents, checkProperty))
  }
}

export default connect(null, mapDispatchToProps)(ContentsToDb)
