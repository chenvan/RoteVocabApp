import React, { Component } from 'react';
import { connect } from 'react-redux';
import { initApp, deleteVocabListFromCollection } from './lib/Action/Action';
import CustomImage from './lib/Components/CustomImage';
import { CustomImageButton } from './lib/Components/Button';
import DrawerView from './lib/Components/DrawerView';
import RNFS from 'react-native-fs';
import {
  StyleSheet,
  View,
  Text,
  ListView,
  ToastAndroid,
  ToolbarAndroid,
  TouchableOpacity,
  AsyncStorage,
  StatusBar,
  DrawerLayoutAndroid,
  ActivityIndicator,
  Alert
} from 'react-native';

class APP extends Component{
  constructor(props){
    super(props);

    const dataSource = new ListView.DataSource({rowHasChanged:(r1,r2) => {

      if(this.forceRenderListView){
        return true;
      }

      let prevIndex = this.prevSelectList.indexOf(r2),
          index = this.selectList.indexOf(r2);

      if((prevIndex > -1 && index === -1) || (prevIndex === -1 && index > -1) || this.prevPropsData[r2] !== this.nextPropsData[r2]){
        //ToastAndroid.show(r2+' return true', ToastAndroid.SHORT);
        return true;
      }else{
        return false;
      }

    }});

    this.state = {
        isEditState: false,
        dataSource,
    };
    this.selectList = [];
    this.prevSelectList = [];
    this.forceRenderListView = false;
    this.db = null;
    this.prevPropsData = {}
    this.nextPropsData = {}
  }

  componentWillMount(){
    this.props.initApp();
  }

  componentWillReceiveProps(newProps){

    if(this.state.isEditState){
      this.selectList = [];
      this.prevSelectList = [];
    }else{
      this.prevPropsData = Object.assign({}, this.props.data);
      this.nextPropsData = Object.assign({}, newProps.data);
    }

    this.db = Object.keys(newProps.data);
    //由于this.props.data还没有改变，所以尽管封面的网址更改了，但是setState无法更改
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.db)
    })
  }

  componentDidMount(){
    StatusBar.setBackgroundColor('#1976D2',true);
  }

  componentDidUpdate(){

    if(this.forceRenderListView === true){
      this.forceRenderListView = false;
    }
  }

  render(){
    //ToastAndroid.show(''+this.props.init,ToastAndroid.SHORT);
    //this.props.init first undefined and then true, final false
    if(this.props.init){
      return (
        <View style = {{flex: 1, justifyContent: 'center'}}>
          <ActivityIndicator size = 'large' />
        </View>
      )
    }else{
      return (
        <DrawerLayoutAndroid
	        ref={(drawer) => this.drawer = drawer}
	        drawerWidth={300}
	        drawerPosition={DrawerLayoutAndroid.positions.Left}
	        renderNavigationView={() => <DrawerView /> }
	    	  onDrawerClose={() => this.drawerStateOpen = false}
	    	  onDrawerOpen={()=> this.drawerStateOpen = true}
		    >
          <View style = {styles.mainContainer}>
            {
              this.state.isEditState ?
              <ToolbarAndroid
                navIcon = {{uri: 'ic_arrow_back_white_36dp'}}
                overflowIcon = {{uri: 'ic_more_vert_white_36dp'}}
                actions = {[
                  {title: '导出', icon: {uri: 'ic_file_upload_white_36dp'}, show: 'always'},
                  {title: '删除', icon: {uri: 'ic_delete_forever_white_36dp'}, show: 'always'},
                  {title: '全选', show: 'never'},
                  {title: '清除全选', show: 'never'}
                ]}
                title = {this.selectList.length.toString()}
                titleColor = 'white'
                onIconClicked = {this._changeEditState.bind(this, false)}
                onActionSelected = {(position) => {
                  switch(position){
                    case 0:
                      return this._exportSelectItem.call(this);
                    case 1:
                     return this._deleteSelectItem.call(this);
                    case 2:
                     return this._selectAllItem.call(this);
                    case 3:
                     return this._clearSelectItem.call(this);
                  }
                }}
                style = {styles.toolBar}
              />
              :
              <View style = {{flex: 0, height: 56, flexDirection: 'row', backgroundColor: '#2196F3', alignItems: 'center', justifyContent: 'space-between'}}>
                <View style = {{flex: 0, flexDirection: 'row', alignItems: 'center', marginLeft: 12}}>
                  <CustomImageButton
                    source = {{uri: 'ic_menu_white_36dp'}}
                    style = {{height: 36, width: 36}}
                    onPress = {() => this.drawer.openDrawer()}
                  />
                  <Text style = {{color: 'white', fontSize: 22, marginLeft: 8}}>{'透析单词'}</Text>
                </View>
                <CustomImageButton
                  source = {{uri: 'ic_add_circle_white_36dp'}}
                  onPress = {this._enterAddFileScene.bind(this)}
                  style = {{height: 36, width: 36, marginRight: 12}}
                />
              </View>
            }
            <ListView
                dataSource = {this.state.dataSource}
                style = {{marginTop:8}}
                renderRow = {(rowData, sectionID, rowID) => showVocabList.call(this, this.props.data[rowData], rowData)}
             />
         </View>
       </DrawerLayoutAndroid>
      )
    }
  }

  _enterAddFileScene(){
    this.props.navigator.push({
      name: 'addFile'
    })
  }

  _enterSearchCoverImageScene(information){

    this.props.navigator.push({
      name: 'searchCoverImageScene',
      information
    })
  }

  _enterVocabList(db){

    this.props.navigator.push({
      name: 'practiceScene',
      db
    })
    //ToastAndroid.show('enter vocabList', ToastAndroid.SHORT);
  }

  _changeEditState(toState){

    this.selectList = [];
    this.prevSelectList = [];
    this.forceRenderListView = true;

    this.setState({
      isEditState: toState
    });

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.db)
    });

    if(toState === true){
      StatusBar.setBackgroundColor('#C2185B',true);
    }else{
      StatusBar.setBackgroundColor('#1976D2',true);
    }
  }

  _handleSelectList(item){

    /*if(this.forceRenderListView){
      this.forceRenderListView = false;
    }*/

    //ToastAndroid.show('in handleSlelecList', ToastAndroid.SHORT);

    let index = this.selectList.indexOf(item);
    this.prevSelectList = this.selectList.slice();

    if(index === -1){
      this.selectList.push(item);
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.db)
      });
    }else{
      this.selectList.splice(index, 1);
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.db)
      });
    }
  }

  _selectAllItem(){
    this.prevSelectList = this.selectList.slice();
    this.selectList = this.db.slice();
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.db)
    })
  }

  _clearSelectItem(){
    this.prevSelectList = this.selectList.slice();
    this.selectList = [];
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.db)
    })
  }

  _deleteSelectItem(){
    if(this.selectList.length === 0){
      ToastAndroid.show('没有选中任何词集',ToastAndroid.SHORT);
    }else{
      Alert.alert(
				'',
				'删除选中词集?',
				[
					{text:'确认', onPress:() => {
            this.props.deleteVocabListFromCollection(this.selectList).then(() => {
              ToastAndroid.show('删除成功', ToastAndroid.SHORT)
            })
          }},
					{text:"取消", onPress:() => {}}
				]
			);
    }
  }

  _exportSelectItem(){

    if(this.selectList.length === 0){
			ToastAndroid.show('没有选中任何词集',ToastAndroid.SHORT);
		}else{

	  	let path = RNFS.ExternalStorageDirectoryPath+'/透析记词';

  		AsyncStorage.multiGet(this.selectList).then((items)=>{

				return RNFS.mkdir(path).then(()=>{
					return items.map((value,index)=>{
						return RNFS.writeFile(path+'/'+value[0]+'.json',value[1],'utf8');
					});

    		}).then((results)=>{

          this.prevSelectList = this.selectList.slice();
          this.selectList = [];
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(Object.keys(this.props.data))
          })

          ToastAndroid.show('导出到：'+path,ToastAndroid.SHORT);
				});
			}).catch((e)=>{
  			ToastAndroid.show('export error:'+e,ToastAndroid.SHORT);
  		});
  	}
  }
}

var mapStateToProps = (state) => {
  return {
    init: state.init,
    data: state.data
  }
}

var mapDispatchToProps = (dispatch) => {
  return {
    initApp: () => dispatch(initApp()),
    deleteVocabListFromCollection: (vocabListArray) => dispatch(deleteVocabListFromCollection(vocabListArray))
  }
}

function showVocabList(coverUrl, listName){
  if(this.state.isEditState){
    let backgroundColor = {backgroundColor: 'white'};
    if(this.selectList.indexOf(listName) !== -1){
      backgroundColor = {backgroundColor: 'gray'};
    }

    return (
      <View style = {[styles.itemContainer, {borderColor: '#F48FB1'}, backgroundColor]}>
        <CustomImage
          inSelectState = {true}
          url = {coverUrl}
          style = {{width: 67, height: 97}}
        />
        <Text
          style={styles.itemText}
          numberOfLines = {2}
          ellipsizeMode = {'tail'}
          onPress = {this._handleSelectList.bind(this, listName)}
        >{listName}</Text>
      </View>
    );
  }else{
    return (
      <View style = {[styles.itemContainer, {backgroundColor: 'white', borderColor: '#90CAF9'}]}>
        <CustomImage
          inSelectState = {false}
          url = {coverUrl}
          style = {{width: 67, height: 97}}
          onLongPress = {this._enterSearchCoverImageScene.bind(this, listName)}
        />
        <Text
          onPress={this._enterVocabList.bind(this, listName)}
          onLongPress={this._changeEditState.bind(this, true)}
          style={styles.itemText}
          numberOfLines = {2}
          ellipsizeMode = {'tail'}
        >{listName}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
  	flex:1,
  	backgroundColor:"#F5F5F5"
  },
  toolBar: {
  	height:56,
  	backgroundColor: '#E91E63'
  },
  itemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 3,
    flex:0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderBottomWidth:1
  },
  itemText:{
    flex: 1,
    paddingLeft: 16,
    fontSize:21,
  	textAlignVertical:'center'
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(APP);
