import React, { Component } from 'react'
import {
  Image,
  TouchableOpacity
} from 'react-native'

export default class CustomImage extends Component {
  render () {
    return (
      this.props.inSelectState ? (
        <Image
          source={this.props.url ? {uri: this.props.url} : require('../PNG/blankCover.png')}
          style={this.props.style}
        />
      ) : (
        <TouchableOpacity onLongPress = {this.props.onLongPress} >
          <Image
            source={this.props.url ? {uri: this.props.url} : require('../PNG/blankCover.png')}
            style={this.props.style}
          />
        </TouchableOpacity>
      )
    )
  }
}
