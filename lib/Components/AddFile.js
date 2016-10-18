
import React, { Component } from 'react';
import {
  StyleSheet,
  Navigator
} from 'react-native';

import DirView from './DirView';
 
export default class AddFile extends Component {
  constructor(props) {
    super(props);
   
  }

  render() {

	return (
		<Navigator
          initialRoute={{name:"内存卡",path:"/storage/emulated/0", isFile: ()=>false}}
          renderScene={(route, navigator) => {
          	
          	return (         		
					<DirView data={route} navigator={navigator} mainNavigator={this.props.navigator} />
          	);
          	           		
          }}
          configureScene={(route, routeStack) => Navigator.SceneConfigs.FadeAndroid}
        />
	);
	   
  }

}
