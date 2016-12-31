import React, { Component } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  ToastAndroid
} from 'react-native';

import {rvDB} from '../rvAPI';

export default class InitScene extends Component {
  constructor(props) {
    super(props);

    this.item = 0;
  }

  render() {
    ToastAndroid.show("In render: "+this.item,ToastAndroid.SHORT);
    if(this.item++ % 2 === 0 )
    {
      //ToastAndroid.show("In render: "+this.item,ToastAndroid.LONG);
      rvDB.getDbNameCollection().then((dbNameCollection)=>{
        this.props.navigator.push({
          name: "homeScene",
          db: dbNameCollection
        });
      }).catch((e)=>{
        ToastAndroid.show("in initScene: "+e,ToastAndroid.SHORT);
      })
    }

    return (
      <ActivityIndicator size="large" style={[styles.centering, {height: 80}]} />
    );

  }

}

const styles = StyleSheet.create({
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});
