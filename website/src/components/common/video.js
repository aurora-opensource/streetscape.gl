import React, {PureComponent} from 'react';
import styled, {keyframes} from 'styled-components';

import {media} from '../../styles';

const VideoContainer = styled.div`
  position: relative;
  width: 800px;
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

const VideoWrapperHeader = styled.div`
  height: 15px;
  background: #e5e5e4;
  border-radius: 3px 3px 0px 0px;
  display: flex;
  align-items: center;
  padding: 0px 5px;
`;

const VideoWrapperHeaderCircle = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 10px;
  background: ${props => props.color};
  margin-left: 5px;
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
  opacity: 0.95;
  cursor: pointer;
  background-image: linear-gradient(transparent, #000);
  transition: opacity 150ms;

  :hover: {
    opacity: 1;
  }
`;

const VideoWrapper = ({children}) => (
  <div>
    <VideoWrapperHeader>
      <VideoWrapperHeaderCircle color="#12BB00" />
      <VideoWrapperHeaderCircle color="#D3AE00" />
      <VideoWrapperHeaderCircle color="#DE3131" />
    </VideoWrapperHeader>
    {children}
  </div>
);

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
      <VideoWrapper key={url}>
        <VideoContainer onClick={this._onVideoClick}>
          {!playing && this._renderPlayButton()}
          <video
            muted
            src={url}
            poster={poster}
            autoPlay={false}
            loop={true}
            ref={elt => this._assignVideoRef(elt)}
          />
        </VideoContainer>
      </VideoWrapper>
    );
  }
}
