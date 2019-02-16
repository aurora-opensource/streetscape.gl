import React, {PureComponent} from 'react';
import styled, {keyframes} from 'styled-components';

import {media} from '../../styles';

const VideoContainer = styled.div`
  position: relative;
  width: 800px;
  background: #000;
  line-height: 0;
  ${media.portable`
    width: 500px;
  `} ${media.palm`
    width: 100%;
  `};

  video {
    width: 100%;
  }
`;

const SlideShowAnimation = keyframes`
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1.0
  }
`;

const FadeIn = styled.div`
  animation-name: ${SlideShowAnimation};
  animation-timing-function: ease-in-out;
  animation-duration: 200ms;
  animation-delay: 200ms;
  animation-fill-mode: both;
`;

const VideoOverlayPlayButton = styled.svg`
  z-index: 1000;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 10px calc(50% - 50px);
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  opacity: 0.6;
  cursor: pointer;
  background-image: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
  transition: opacity 150ms;

  :hover {
    opacity: 1;
  }
`;

export default class Video extends PureComponent {
  constructor(props) {
    super(props);
    this.videoElement = null;
  }

  state = {
    playing: false
  };

  _onVideoClick = () => {
    if (this.state.playing) {
      this.setState({playing: false});
      this.videoElement.pause();
    } else {
      this.setState({playing: true});
      this.videoElement.play();
    }
  };

  _assignVideoRef = element => {
    this.videoElement = element;
  };

  _renderPlayButton = () => {
    return (
      <FadeIn>
        <VideoOverlayPlayButton viewBox="0 0 200 200" alt="Play video">
          <circle cx="100" cy="100" r="90" fill="none" strokeWidth="15" stroke="#fff" />
          <polygon points="70, 55 70, 145 145, 100" fill="#fff" />
        </VideoOverlayPlayButton>
      </FadeIn>
    );
  };

  render() {
    const {url, poster} = this.props;
    const {playing} = this.state;
    return (
      <VideoContainer onClick={this._onVideoClick}>
        <video
          muted
          src={url}
          poster={poster}
          autoPlay={false}
          loop={true}
          ref={elt => this._assignVideoRef(elt)}
        />
        {!playing && this._renderPlayButton()}
      </VideoContainer>
    );
  }
}
