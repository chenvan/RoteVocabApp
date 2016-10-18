import React, { Component } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';

import rvDB from '../rvDB';
 
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
        console.log(e);
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
 
