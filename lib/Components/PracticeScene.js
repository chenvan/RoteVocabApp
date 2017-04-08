import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ToolbarAndroid,
  ToastAndroid,
  TouchableOpacity,
  Image,
  BackAndroid,
  Clipboard,
  ListView,
  Animated,
  Easing,
  Vibration,
} from 'react-native';

import {rvDB} from '../rvAPI';
import ParsedText from 'react-native-parsed-text'
import { SwipeListView } from 'react-native-swipe-list-view'

export default class PracticeScene extends Component {
	constructor(props) {
	  super(props);

	  const ds = new ListView.DataSource({rowHasChanged:(r1,r2) => {
	  		return r1.item !== r2.item
	  	}
	  });

	  this.db = null;
	  this.lastYLocation = 0;
	  this.checkBookmarkReadyTimeoutID = null;
    this.deviceWidth = 360;

	  this.state = {
	  	buttonSize: new Animated.Value(0),
	  	textSize: new Animated.Value(30),
	  	toggle: true,
	  	state: "init",
	  	dataSource: ds.cloneWithRows([{item:'加载中...'}])
	  };

	  this._exitPracticeScene = this._exitPracticeScene.bind(this);
    this._checkDeviceWidth = this._checkDeviceWidth.bind(this);
	}

  componentWillMount(){

    rvDB.showDataItemRows(this.props.db).then(([results,lastYLocation]) => {
  			if(results === null){

          ToastAndroid.show("没有要背的东西",ToastAndroid.SHORT);
          this.props.navigator.pop();

  			}else{

  				this.db = results;
  				this.lastYLocation = lastYLocation;

  				if(lastYLocation !== 0){

  					this.checkBookmarkReadyTimeoutID = setInterval(()=>{
              // check whether list view reach the record Y location every second
  						if(this.swipteListViewRef._listView.scrollProperties.contentLength >= this.lastYLocation){
  							Animated.parallel([
                  // occur button
  								Animated.timing(this.state.buttonSize,
  									{
  										toValue:70,
  										easing: Easing.in(Easing.circle),
  										duration:500
  									}
  								),
                  // remove text
  								Animated.timing(this.state.textSize,
  									{
  										toValue:0,
  										easing: Easing.in(Easing.circle),
  										duration:500
  									}
  								)
  							]).start();

  							clearInterval(this.checkBookmarkReadyTimeoutID);
  							this.checkBookmarkReadyTimeoutID = null;
  						}
  					},1000);
  				}

  				setTimeout(()=>{

            this.setState({
  						state:'initDone',
  						dataSource: this.state.dataSource.cloneWithRows(this.db)
  					})

  				},500);

  			}
  		}).catch((e) => {
  			ToastAndroid.show(""+e,ToastAndroid.SHORT);
        this.props.navigator.pop();
  		});
  }

  componentDidMount(){

    BackAndroid.addEventListener('PracticeSceneBackPress', this._exitPracticeScene);
  }

  componentWillUnmount(){
      //ToastAndroid.show('in componentWillUnmount',ToastAndroid.SHORT);
      BackAndroid.removeEventListener('PracticeSceneBackPress',this._exitPracticeScene);
  }

	render() {

    return (
			<View style={{flex:1}} onLayout = {this._checkDeviceWidth}>
		    	<ToolbarAndroid
		            navIcon={{uri: 'ic_arrow_back_white_36dp'}}
		            title={this.props.db}
		            titleColor="white"
		            style={styles.toolBar}
		            onIconClicked={this._exitPracticeScene}
		        />
		        <View style={{flex:1,backgroundColor:'#FAFAFA'}}>
			        <SwipeListView
			        	dataSource={this.state.dataSource}
			        	ref={(swipteListViewRef)=>this.swipteListViewRef = swipteListViewRef}
			        	renderRow={ (rowData, secdId, rowId) => (
		        			<View
		        				style={styles.rowFront}
		        			>
			        			{
			        				this.state.state !== 'initDone' ?
			        				<Text style={[styles.textShow,{textAlign:'center'}]}>{rowData.item}</Text>
			        				:
				        			<ParsedText
					         			style={styles.textShow}
					         			parse={
					         				[
					         					{pattern:/\w+/,onPress:this._handleWordPress}//ParsedText not support LongPress
					         				]
					         			}
					         		>
				         				{rowData.item}
				         			</ParsedText>
			        			}
			        		</View>
			        	)}
			        	renderHiddenRow={(rowData, secdId, rowId, rowMap) => (

		         			<TouchableOpacity style={styles.rowBack} onPress={this._delete.bind(this,secdId,rowId,rowMap)}>
			         			<View style={{width: 66}}>
				         			<Image
				         				source={{uri:'ic_delete_forever_white_36dp'}}
				         				style={{width:36,height:36,marginLeft:15}}
				         			/>
			         			</View>
		         			</TouchableOpacity>

			        	)}
			        	closeOnRowPress={false}
			        	rightOpenValue={-66}
			        	recalculateHiddenLayout={true}
			        	disableRightSwipe={true}
			        	disableLeftSwipe={this.state.state !== 'initDone' ? true : false}
			        	initialListSize={5}//默认值是10
			        	scrollRenderAheadDistance={this.lastYLocation+800} //这个是row离屏幕还有某像素时就渲染
			        />
			        {
				        this.lastYLocation !== 0 && this.state.state === 'initDone'?
			        	<View style={styles.overlay}>

                  <Animated.Text
			        			style={{
			        				color:'#448AFF',
			        				fontSize:this.state.textSize
			        			}}
			        		>加载上次退出点</Animated.Text>
                {/* cancel button whic use to cancel loading record Y location */}
			        		<TouchableOpacity onPress={()=>{
			        			if(this.checkBookmarkReadyTimeoutID !== null){
			        				clearInterval(this.checkBookmarkReadyTimeoutID);
			        				this.checkBookmarkReadyTimeoutID = null;
			        			}
			        			this.lastYLocation = 0;
			        			this.setState({toggle: !this.state.toggle});
			        		}}>
			        			<View style={styles.cancelBookmarkButton}>
			        				<Image source={{uri:'ic_cancel_white_36dp'}} style={{width:36,height:36}}/>
			        			</View>
			        		</TouchableOpacity>
                  {/* button use to go to the record Y location */}
			        		<TouchableOpacity onPress={()=>{
				        		this.swipteListViewRef._listView.scrollTo({y:this.lastYLocation});
				        		this.lastYLocation = 0;
				        		this.setState({toggle: !this.state.toggle});
				        	}}>
					        	<Animated.View
					        		style={{
					        			width: this.state.buttonSize,
					        			height: this.state.buttonSize,
					        			borderRadius: this.state.buttonSize.interpolate({
					        				inputRange:[0,70],
											    outputRange:[0,35]
					        			}),
					        			backgroundColor:'#E040FB',
					        			justifyContent: 'center',
					        			alignItems: 'center'
					        		}}
					        	>
					        		<Image source={{uri:'ic_bookmark_border_white_36dp'}} style={{width:36, height:36}}/>
					        	</Animated.View>
				        	</TouchableOpacity>
			        	</View>
				        :
                null
			        }
			    </View>
			</View>
		);
	}

	_handleWordPress(word){
		ToastAndroid.show('复制'+word+'到剪贴板',ToastAndroid.SHORT);
		Clipboard.setString(word);
	}

	_delete(secdId, rowId, rowMap) {

    let data = this.db.slice();

    rvDB.deleteDataItem(this.props.db, rowId).then(()=>{

			data.splice(rowId,1);

			if(data.length === 0){	//唯一的一个删除
            	this.props.navigator.pop();
			}else{

        Animated.timing(
          rowMap[`${secdId}${rowId}`]._translateX,
          {
            duration: 100,
            toValue: -this.deviceWidth
          }
        ).start();

				Vibration.vibrate([0,50]);
				this.db = data;

        // should wait above delete animition finish, so wait 150 ms to update db
				setTimeout(()=>{
					this.setState({
						dataSource: this.state.dataSource.cloneWithRows(this.db)
					});
				},150);
			}
		}).catch((e)=>{
			ToastAndroid.show('remove occur wrong: '+e, ToastAndroid.SHORT);
		})
	}

	_exitPracticeScene(){

    	let leaveLocation =  this.swipteListViewRef._listView.scrollProperties.offset;

    	if(this.checkBookmarkReadyTimeoutID !== null) clearInterval(this.checkBookmarkReadyTimeoutID)

    	rvDB.saveDataItemBookmark(this.props.db,leaveLocation).then(()=>{
    		this.props.navigator.pop();
    	}).catch((e)=>{
    		ToastAndroid.show(''+e,ToastAndroid.SHORT);
    	});
	}

  _checkDeviceWidth(e){
    //ToastAndroid.show('width: '+e.nativeEvent.layout.width, ToastAndroid.SHORT);
    this.deviceWidth = e.nativeEvent.layout.width;
  }
}

const styles = StyleSheet.create({
  textShow: {
  	fontSize:21,
  	marginHorizontal:20,
  	marginVertical:25,
  	lineHeight:28
  },
  rowBack: {
  	alignItems: 'flex-end',
  	backgroundColor: '#FF5252',
  	justifyContent: 'center',
  	flex:1
  },
  rowFront: {
  	borderBottomColor: '#F0F0F0',
    backgroundColor: 'white',
  	borderBottomWidth: 1,
  },
  toolBar:{
  	height:56,
  	backgroundColor: "#2196F3"
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(189, 189, 189, 0.8)',
    justifyContent: 'center',
    alignItems:'center'
  },
  cancelBookmarkButton: {
  	width:70,
  	height:70,
  	borderRadius:35,
  	backgroundColor:'#FF5252',
  	justifyContent: 'center',
  	alignItems: 'center',
  	marginVertical:20
  }
});
