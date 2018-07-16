import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AlloyTouch from 'alloytouch';
const transform = require('./libs/transform');

import './style.less';

const btmLoaderMsg = {
  'waiting': '上拉加载更多',
  'pending': '释放加载数据',
  'loading': '正在加载中...',
  'ending': '没有更多数据了',
  'error': '服务异常，请重新上拉',
};

const refLoaderMsg = {
  'waiting': '下拉刷新',
  'pending': '释放刷新',
  'loading': '正在刷新中...',
}

class TouchScroll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      curState: 'waiting',
      downState: 'waiting',
      hasMore: false,
    }
    this.hadLoad = false;
    this.touchRef = React.createRef();
    this.refreshRef = React.createRef();
    this.scrollerRef = React.createRef();
  }

  componentDidMount() {
    const {hasMore, error, getScroller} = this.props;
    this.setState({
      hasMore,
      error
    });
    
    this.initAlloy();
    /**
     *  this.scrollerRef 传给外层，使外层可以获得整个滑动列表句柄控制权
     */
    getScroller && getScroller(this.scrollerRef);
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

  preventTouchMove = (evt) => {
    if (evt && evt.preventDefault) {
      evt.preventDefault();
    }
  }

  initAlloy = () => {
    const {changeCb, isPullUp, isPullDown} = this.props;
    if (isPullDown) {
      transform(this.refreshRef.current);
    }
    transform(this.scrollerRef.current, true);
    const config = {
      touch: this.touchRef.current,
      vertical: true,
      target: this.scrollerRef.current,
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
        if (isPullDown) {
          this.setState({downState: 'waiting'});
        }
      },
      lockDirection: false,
      change: (v) => {
        changeCb && changeCb(v);
      },
    }
    const otherConfig = isPullUp || isPullDown ? {
      touchMove: this.touchMove, 
      touchEnd: this.touchEnd
    } : {};
    this.scroll = new AlloyTouch(Object.assign({}, config, otherConfig));
  }

  touchMove = (evt, v) => {
    const {hasMore, curState, downState} = this.state;
    const {isPullUp, isPullDown, pdSize} = this.props;
    if (hasMore) {
      this.hadLoad = false;
    }
    if (isPullUp) {
      if (v < this.scroll.min && curState !== 'loading' && !this.hadLoad) {
        this.setState({curState: 'pending'});
      }
    }
    if (isPullDown) {
      if (v > pdSize && downState !== 'loading') {
        this.setState({downState: 'pending'});
      }
    }
  }

  touchEnd = (evt, v) => {
    const {hasMore, curState, downState} = this.state;
    const {loadMore, isPullUp, isPullDown, refresh} = this.props;
    if (isPullUp) {
      if (hasMore) {
        if (!this.hadLoad && v < this.scroll.min && curState !== 'loading') {
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
    if (isPullDown) {
      if (downState === 'pending') {
        this.setState({downState: 'loading'});
        refresh && refresh(v);
      }
    }
  }

  resetMin = () => {
    const {otherHeight} = this.props;
    const initMin = 0 - (parseInt(this.touchRef.current.scrollHeight) - window.innerHeight + otherHeight);
    this.scroll.min = initMin > 0 ? 0 : initMin;
  }

  render() {
    const {children, isPullUp, touchCls, scrollCls, isPullDown} = this.props;
    const {curState, hasMore, downState} = this.state;
    return (
      <div className={classnames('touch-scoll-wrap', touchCls)} ref={this.touchRef}>
        <section className={classnames('scroll-list', scrollCls)} ref={this.scrollerRef}>
          {isPullDown ? (
            <div className="refresh" ref={this.refreshRef}>{refLoaderMsg[downState]}</div>
          ) : null}
          {children}
          {isPullUp && hasMore ? (
            <div className="loader-more">{btmLoaderMsg[curState]}</div>
          ) : null}
        </section>
      </div>
    );
  }
}

TouchScroll.propTypes = {
  children: PropTypes.node,
  isPullUp: PropTypes.bool,
  isPullDown: PropTypes.bool,
  changeCb: PropTypes.func,
  otherHeight: PropTypes.number,
  touchCls: PropTypes.string,
  scrollCls: PropTypes.string,
  refresh: PropTypes.func,
  loadMore: PropTypes.func,
  pdSize: PropTypes.number,
  getScroller: PropTypes.func,  //获得scroller
}

TouchScroll.defaultProps = {
  otherHeight: 0,
  isPullUp: false,
  isPullDown: false,
  pdSize: 30
}

export default TouchScroll;
