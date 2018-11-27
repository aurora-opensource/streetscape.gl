import React, {PureComponent} from 'react';
import styled from 'styled-components';

import {media} from '../../styles';

const NavContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 24px;
  ${media.palm`
    margin-top: 12px;
  `};
`;

const NavItems = styled.div`
  display: flex;
  justify-content: center;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  margin: ${props => props.theme.margins.small};
  font-size: 10px;
  text-align: center;
  filter: ${props => props.isActive && 'brightness(300%)'};
  transform: ${props => props.isActive && 'scale(1.1)'};
  transition: transform 500ms, filter 500ms;
  cursor: pointer;
  :hover {
    transform: scale(1.1);
  }

  ${media.palm`
    margin: 2px 4px;
    font-size: 8px;
  `};
`;

const Text = styled.span`
  margin-bottom: 24px;
  ${media.palm`
    margin-bottom: 12px;
  `};
`;

const NavIcon = styled.div`
  display: block;

  width: ${props => (props.isActive ? 12 : 10)}px;
  height: ${props => (props.isActive ? 12 : 10)}px;

  border-radius: ${props => (props.isActive ? 6 : 5)}px;
  background-color: ${props => (props.isActive ? '#FFFFFF' : '#9BA0A5')};
`;

export default class Nav extends PureComponent {
  render() {
    const {items, selectedIndex, onClick} = this.props;
    const text = items[selectedIndex].text;
    return (
      <NavContainer>
        {text && <Text>{text}</Text>}
        <NavItems>
          {items.map((_, i) => {
            const isActive = selectedIndex === i;
            return (
              <NavItem key={i} isActive={isActive} onClick={() => onClick(i)}>
                <NavIcon isActive={isActive} />
              </NavItem>
            );
          })}
        </NavItems>
      </NavContainer>
    );
  }
}
