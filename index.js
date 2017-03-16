import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import AlloyTouch from 'alloytouch';
const transform = require('../libs/transform');

import './style.less';

const btmLoaderMsg = {
  'waiting': '上拉加载更多',
  'pending': '释放加载数据',
  'loading': '正在加载中...',
  'ending': '没有更多数据了',
  'error': '服务异常，请重新上拉',
};

export default class TouchScroll extends Component {
  static propTypes = {
    children: PropTypes.node,
    isPullUp: PropTypes.bool,
    changeCb: PropTypes.func,
    otherHeight: PropTypes.number,
    touchCls: PropTypes.string,
    scrollCls: PropTypes.string,
    getScroller: PropTypes.func,  //获得scroller 
  }

  static defaultProps = {
    otherHeight: 0,
    isPullUp: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      curState: 'waiting',
      hasMore: false,
    }
    this.hadLoad = false;
  }

  componentDidMount() {
    const {hasMore, error, getScroller} = this.props;
    this.setState({
      hasMore,
      error
    });
    
    this.initAlloy();
    getScroller && getScroller(this.scroller);
    document.addEventListener('touchmove', this.preventTouchMove, false);
  }

  componentWillReceiveProps(nextProps) {
    const {hasMore, error} = nextProps;
    this.setState({hasMore, error});
    if (hasMore) {
      this.hadLoad = false;
      if (error) {
        this.setState({curState: 'error'});
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.hasMore !== nextProps.hasMore || this.state.curState !== nextState.curState || !this.hadLoad) {
      return true;
    }
    return false;
  }

  componentDidUpdate(nextProps, nextState) {
    this.resetMin();
  }

  componentWillUnmount() {
    this.scroll = null;
    document.removeEventListener('touchmove', this.preventTouchMove, false);
  }

  getTouchRef = (touch) => {
    if (!touch) { return null;}
    this.touch = touch;
  }

  scroller = (scroller) => {
    if (!scroller) {return null;}
    this.scroller = scroller;
  }

  preventTouchMove = (evt) => {
    evt.preventDefault();
  }

  transform = () => {
    const {otherTransform} = this.state;
    const hasOtherTransform = otherTransform && otherTransform.length > 0;
    console.log(otherTransform);
    if (hasOtherTransform) {
      for (let i = otherTransform.length - 1; i >= 0; i--) {
        transform(otherTransform[i]);
      }
    }
  }

  initAlloy = () => {
    const {changeCb, isPullUp, otherHeight} = this.props;
    /*const {otherTransform} = this.state;
    const hasOtherTransform = otherTransform && otherTransform.length > 0;*/
    transform(this.scroller, true);
    const config = {
      touch: this.touch,
      vertical: true,
      target: this.scroller,
      preventDefault: false,
      property: 'translateY',
      min: 0,
      max: 0,
      maxSpeed: 2,
      outFactor: 0.1,
      inertia: true,
      spring: true,
      touchStart: () => {
        this.resetMin();
      },
      lockDirection: false,
      change: (v) => {
        /*if (hasOtherTransform) {
          for (let i = otherTransform.length - 1; i >= 0; i--) {
            otherTransform[i].translateY = v;
          }
        }*/
        changeCb && changeCb(v);
      },
    }
    const otherConfig = isPullUp ? {
      touchMove: this.touchMove, 
      touchEnd: this.touchEnd
    } : {};
    this.scroll = new AlloyTouch(Object.assign({}, config, otherConfig));
  }

  touchMove = (evt, v) => {
    const {hasMore} = this.state;
    if (v < this.scroll.min && this.state.curState !== 'loading' && !this.hadLoad && hasMore) {
      this.setState({curState: 'pending'});
    }
  }

  touchEnd = (evt, v) => {
    const {hasMore} = this.state;
    const {loadMore} = this.props;
    if (hasMore) {
      if (!this.hadLoad && v < this.scroll.min && this.state.curState !== 'loading') {
        this.setState({curState: 'loading'});
        loadMore && loadMore(v, () => {
          this.setState({curState: 'waiting'});
        });
        this.hadLoad = true;
      } 
    } else {
      this.setState({curState: 'ending'});
    }
  }

  resetMin = () => {
    const {otherHeight} = this.props;
    const initMin = 0 - (parseInt(this.touch.scrollHeight) - window.innerHeight + otherHeight);
    this.scroll.min = initMin > 0 ? 0 : initMin;
  }

  render() {
    const {children, isPullUp, touchCls, scrollCls} = this.props;
    const {curState, hasMore} = this.state;
    return (
      <div className={classnames('touch-scoll-wrap', touchCls)} ref={this.getTouchRef}>
        <section className={classnames('scroll-list', scrollCls)} ref={this.scroller}>
          {children}
          {isPullUp && hasMore ? (
            <div className="loader-more">{btmLoaderMsg[curState]}</div>
          ) : null}
        </section>
      </div>
    );
  }
}
