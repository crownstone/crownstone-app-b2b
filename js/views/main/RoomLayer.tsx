import * as React from 'react'; import { Component } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  NativeModules,
  PanResponder,
  ScrollView,
  TouchableHighlight,
  Text,
  View
} from 'react-native';

let Actions = require('react-native-router-flux').Actions;
import { SetupStateHandler } from '../../native/setup/SetupStateHandler'
import { RoomCircle }        from '../components/RoomCircle'
import { getFloatingStones, getAmountOfStonesInLocation } from '../../util/DataUtil'
import {styles, colors, screenWidth, screenHeight, topBarHeight, tabBarHeight, availableScreenHeight} from '../styles'
import { LOG }               from '../../logging/Log'
import PhysicsEngine from "../../logic/PhysicsEngine";


export class RoomLayer extends Component<any, any> {
  _panResponder: any = {};
  _multiTouch = false;
  _currentSphere = null;
  _multiTouchUsed = false;
  _initialDistance : number;
  _currentScale : number;
  _minScale : number = 0.1;
  _maxScale : number = 1.25;
  _baseRadius : number;
  _pressedRoom : any = false;

  _validTap = false;
  _lastTapLocation = false;
  _lastTap = 0;
  _totalMovedX = 0;
  _totalMovedY = 0;
  _panOffset : any = {x:0, y:0};
  _currentPan : any = {x:0, y:0};

  physicsEngine : any;
  panListener : any;

  animationFrame : any;

  nodes: any;
  unsubscribeStoreEvents: any;

  constructor(props) {
    super();

    this._baseRadius = 0.15 * screenWidth;
    let initialScale = 1;
    this._currentScale = initialScale;
    this.state = {
      presentUsers: {},
      scale: new Animated.Value(initialScale),
      opacity: new Animated.Value(1),
      pan: new Animated.ValueXY(),
      rooms: {},
      hoverRoom : false,
    };

    this.physicsEngine = new PhysicsEngine();
    this._currentSphere = props.sphereId;
  }

  _findPress(x,y) {
    let cx = 0.5*screenWidth;
    let cy = 0.5*availableScreenHeight;

    let x2 = x - this._currentPan.x;
    let y2 = y - this._currentPan.y;

    let dx2 = x2 - cx;
    let dy2 = y2 - cy;

    let dx1 = dx2 / this._currentScale;
    let dy1 = dy2 / this._currentScale;

    let x1 = cx + dx1;
    let y1 = cy + dy1;

    let nodeIds = Object.keys(this.nodes);
    let radius = 2*this._baseRadius;
    let found = false;
    for(let i = 0; i < nodeIds.length; i++) {
      let node = this.nodes[nodeIds[i]];
      // console.log(node.x + radius > correctedX, node.y + radius > correctedY, node.x < correctedX, node.y < correctedY, correctedY);
      if (node.x + radius > x1 && node.y + radius > y1 && node.x < x1 && node.y < y1) {
        found = true;
        if (this.state.hoverRoom !== nodeIds[i]) {
          this.setState({hoverRoom: nodeIds[i]});
        }
        return nodeIds[i];
      }
    }

    if (!found) {
      if (this.state.hoverRoom !== false) {
        this.setState({hoverRoom: false});
      }
    }
    return false;
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.sphereId !== this._currentSphere) {
      this._currentSphere = nextProps.sphereId;
      this._panOffset.x = 0;
      this._panOffset.y = 0;
      this.state.pan.setOffset({x: this._panOffset.x, y: this._panOffset.y });
      this.state.pan.setValue({ x: 0, y: 0 });
      this._currentPan = {x:0, y:0};
      this._currentScale = 1;

      this.loadInSolver();
    }
  }

  componentWillMount() {
    this.panListener = this.state.pan.addListener(value => this._currentPan = value);
    this.loadInSolver();

    // configure the pan responder
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        this.state.pan.stopAnimation();
        // gestureState.d{x,y} will be set to zero now
        this._multiTouchUsed = false;
        this._totalMovedX = 0;
        this._totalMovedY = 0;
        this._pressedRoom = this._findPress(gestureState.x0, gestureState.y0 - topBarHeight);
        this._validTap = true;
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}

        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        if (gestureState.numberActiveTouches === 1) {
          this._totalMovedX += Math.abs(gestureState.dx);
          this._totalMovedY += Math.abs(gestureState.dy);
          this._multiTouch = false;

          if (this._totalMovedX < 50 && this._totalMovedY < 50 && this._multiTouchUsed === false) {
            this._pressedRoom = this._findPress(gestureState.x0, gestureState.y0 - topBarHeight);
            if (this._pressedRoom !== false) {

            }
            else {
              return Animated.event([null, { dx: this.state.pan.x, dy: this.state.pan.y }])(evt, gestureState);
            }
          }
          else {
            this.clearTap();
            return Animated.event([null, { dx: this.state.pan.x, dy: this.state.pan.y }])(evt, gestureState);
          }

        }
        else {
          this.clearTap();
          this._multiTouchUsed = true;
          let distance = getDistance(evt.nativeEvent.touches);
          if (this._multiTouch === false) {
            this._initialDistance = distance;
            this._multiTouch = true;
          }
          else {
            this._currentScale = this._currentScale * (distance/this._initialDistance);
            this._initialDistance = distance;
            this.state.scale.setValue(this._currentScale);
            return Animated.event([null, { dx: this.state.pan.x, dy: this.state.pan.y }])(evt, gestureState);
          }
        }
      },

      onPanResponderRelease: (evt, gestureState) => {
        // console.log(gestureState.vx, gestureState.vy);
        if (gestureState.vx !== 0 || gestureState.vy !== 0) {
          Animated.decay(this.state.pan, { velocity: {x: gestureState.vx, y: gestureState.vy}, deceleration:0.99}).start(() => {
            this._panOffset.x = this._currentPan.x;
            this._panOffset.y = this._currentPan.y;
            this.state.pan.setOffset({x: this._currentPan.x, y: this._currentPan.y });
            this.state.pan.setValue({ x: 0, y: 0 });
          });
        }
        else {
          this._panOffset.x += gestureState.dx;
          this._panOffset.y += gestureState.dy;
          this.state.pan.setOffset({x: this._panOffset.x, y: this._panOffset.y });
          this.state.pan.setValue({ x: 0, y: 0 });
        }

        this._multiTouch = false;

        if (this._validTap === true) {
          if (this._lastTapLocation === this._pressedRoom && new Date().valueOf() - this._lastTap < 300) {
            this._recenter();
          }

          this._lastTapLocation = this._pressedRoom;
          this._lastTap = new Date().valueOf();
        }

        if (this._pressedRoom !== false) {
          this.setState({hoverRoom: false});
          Actions.roomOverview({sphereId: this.props.sphereId, locationId: this._pressedRoom});
        }

        if (this._currentScale > this._maxScale) {
          Animated.spring(this.state.scale, { toValue: this._maxScale, friction: 7, tension: 70 }).start(() => { this._currentScale = this._maxScale; });
        }
        else if (this._currentScale < this._minScale) {
          Animated.spring(this.state.scale, { toValue: this._minScale, friction: 7, tension: 70 }).start(() => { this._currentScale = this._minScale; });
        }


      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }

  componentDidMount() {
    this.unsubscribeStoreEvents = this.props.eventBus.on("databaseChange", (data) => {
      let change = data.change;

      if (
        change.changeLocations
      ) {
        this.loadInSolver();
      }
    });

  }

  componentWillUnmount() {
    this.unsubscribeStoreEvents();
    this.state.pan.removeListener(this.panListener);
    this.physicsEngine.clear();
  }

  _recenter(fadeIn = false) {
    // get bounding box
    let minX = 1e10;
    let maxX = -1e10;
    let minY = 1e10;
    let maxY = -1e10;
    let nodeIds = Object.keys(this.nodes);


    if (nodeIds.length === 0) {
      return;
    }

    for(let i = 0; i < nodeIds.length; i++) {
      let node = this.nodes[nodeIds[i]];
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    }
    // correct bounding box
    maxX += 2*this._baseRadius;
    maxY += 2*this._baseRadius;

    // add padding
    minX -= 0.3*this._baseRadius;
    minY -= 0.3*this._baseRadius;
    maxX += 0.3*this._baseRadius;
    maxY += 0.3*this._baseRadius;

    // bounding Box
    let requiredWidth  = maxX - minX;
    let requiredHeight = maxY - minY;

    // set scale
    let newScale = Math.min(this._maxScale, Math.max(this._minScale, Math.min(screenWidth/requiredWidth, availableScreenHeight/requiredHeight)));

    // center of bounding box projected on world coordinates
    let massCenter = {x: minX + 0.5*requiredWidth, y: minY + 0.5*requiredHeight};

    // actual center of the view.
    let viewCenter = {x: 0.5*screenWidth, y: 0.5*availableScreenHeight};

    // determine offset to center everything.
    let offsetRequired = {x: newScale*(viewCenter.x - massCenter.x) - this._panOffset.x, y: newScale*(viewCenter.y - massCenter.y) - this._panOffset.y};

    // batch animations together.
    let animations = [];
    animations.push(Animated.timing(this.state.opacity, { toValue: 1, duration:600}));
    animations.push(Animated.timing(this.state.scale, { toValue: newScale, duration:600}));
    animations.push(Animated.timing(this.state.pan, { toValue: {x: offsetRequired.x, y: offsetRequired.y}, duration:600}));
    Animated.parallel(animations).start(() => {
      this._panOffset.x += offsetRequired.x;
      this._panOffset.y += offsetRequired.y;
      this.state.pan.setOffset({x: this._panOffset.x, y: this._panOffset.y });
      this.state.pan.setValue({ x: 0, y: 0 });
      this._currentPan = {x:0, y:0};
      this._currentScale = newScale;
    });
  }

  clearTap() {
    this._validTap = false;
    this._pressedRoom = false;
    if (this.state.hoverRoom !== false) {
      this.setState({hoverRoom: false});
    }
  }

  loadInSolver() {
    this.physicsEngine.clear();
    const store = this.props.store;
    const state = store.getState();
    let roomIds = Object.keys(state.spheres[this._currentSphere].locations);
    let center = {x: 0.5*screenWidth - this._baseRadius, y: 0.5*availableScreenHeight - this._baseRadius};

    this.state.rooms = {};
    this.nodes = {};
    let edges = {};

    for (let i = 0; i < roomIds.length; i++) {
      let id = roomIds[i];
      this.nodes[id] = {id: id, mass: 1, fixed: false};
      this.state.rooms[id] = {x: new Animated.Value(0), y: new Animated.Value(0)};
    }

    let floatingStones = getFloatingStones(state, this._currentSphere);
    let showFloatingCrownstones = floatingStones.length > 0 || SetupStateHandler.areSetupStonesAvailable() === true;

    if (showFloatingCrownstones) {
      let id = null;
      this.nodes[id] = {id: id, mass: 1, fixed: false};
      this.state.rooms[id] = {x: new Animated.Value(0), y: new Animated.Value(0)};
    }

    let nodeIds = Object.keys(this.nodes);
    let initialized = false;
    cancelAnimationFrame(this.animationFrame);

    let onStable = () => {
      this.animationFrame = requestAnimationFrame(() => {
        for (let i = 0; i < nodeIds.length; i++) {
          this.state.rooms[nodeIds[i]].x.setValue(this.nodes[nodeIds[i]].x);
          this.state.rooms[nodeIds[i]].y.setValue(this.nodes[nodeIds[i]].y);
        }

        if (initialized === false) {
          this._recenter(true);
          initialized = true;
        }
      })
    };

    this.physicsEngine.initEngine(center, this._baseRadius, () => {}, onStable);
    this.physicsEngine.load(this.nodes, edges);
    this.physicsEngine.stabilize(200, true);

  }


  _renderRoom(locationId, count, index, activeSphere) {
    // variables to pass to the room overview
    return (
      <RoomCircle
        eventBus={this.props.eventBus}
        locationId={locationId}
        active={this.props.sphereId == activeSphere}
        totalAmountOfRoomCircles={count}
        sphereId={this.props.sphereId}
        hover={this.state.hoverRoom === locationId}
        radius={0.15*screenWidth}
        store={this.props.store}
        pos={{x: this.state.rooms[locationId].x, y: this.state.rooms[locationId].y}}
        seeStonesInSetupMode={SetupStateHandler.areSetupStonesAvailable()}
        viewingRemotely={this.props.viewingRemotely}
        key={locationId || 'floating'}
      />
    );
  }

  getRooms() {
    const store = this.props.store;
    const state = store.getState();
    let rooms = state.spheres[this.props.sphereId].locations;

    let floatingStones = getFloatingStones(state, this.props.sphereId);
    let showFloatingCrownstones = floatingStones.length > 0 || SetupStateHandler.areSetupStonesAvailable() === true;

    let roomNodes = [];
    let roomIdArray = Object.keys(rooms).sort();

    let amountOfRooms = roomIdArray.length;

    // the orphaned stones room.
    if (showFloatingCrownstones) {
      amountOfRooms += 1;
    }

    for (let i = 0; i < roomIdArray.length; i++) {
      roomNodes.push(this._renderRoom(roomIdArray[i], amountOfRooms, i, state.app.activeSphere))
    }
    if (showFloatingCrownstones) {
      roomNodes.push(this._renderRoom(null, amountOfRooms, roomIdArray.length, state.app.activeSphere))
    }

    return roomNodes;
  }

  render() {
    if (this.props.sphereId === null) {
      return <View style={{position: 'absolute', top: 0, left: 0, width: screenWidth, flex: 1}} />;
    }
    else {
      const layout = this.state.pan.getLayout();
      let scale = this.state.scale;
      const animatedStyle = {
        transform: [
          { translateX: layout.left },
          { translateY: layout.top },
          { scale: scale },
        ]
      };

      return (
        <View {...this._panResponder.panHandlers} style={{position: 'absolute', top: 0, left: 0, width: screenWidth, height: availableScreenHeight, overflow:"hidden"}}>
          <Animated.View style={[animatedStyle, {width: screenWidth, height: availableScreenHeight, opacity:this.state.opacity}]}>
            {this.getRooms()}
          </Animated.View>
        </View>
      )
    }
  }
}


function getDistance(touches) {
  let firstTouch = touches[0];
  let secondTouch = touches[1];

  let dx = firstTouch.pageX - secondTouch.pageX;
  let dy = firstTouch.pageY - secondTouch.pageY;
  return Math.max(10,Math.sqrt(dx*dx + dy*dy));
}