/* global document */
import 'xviz-config';

import React from 'react';
import {render} from 'react-dom';
import Example from './example';

const root = document.createElement('div');
document.body.appendChild(root);

render(<Example />, root);
