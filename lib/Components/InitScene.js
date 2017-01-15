import React, { Component } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  ToastAndroid,
  View
} from 'react-native';

import {rvDB} from '../rvAPI';

export default class InitScene extends Component {
  constructor(props) {
    super(props);

    this.item = 0;
  }

  render() {

    if(this.item++ % 2 === 0 )
    {
      rvDB.getDbNameCollection().then((dbNameCollection)=>{
        this.props.navigator.push({
          name: "homeScene",
          db: dbNameCollection
        });
      }).catch((e)=>{
        ToastAndroid.show("in initScene: "+e,ToastAndroid.SHORT);
      })
    }

    //ToastAndroid.show("In render: "+this.item,ToastAndroid.SHORT);

    return (
      <View style={{flex:1,justifyContent:'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
}
