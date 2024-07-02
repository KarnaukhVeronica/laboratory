'use client';

import styles from "../page.module.css";
import AceEditor from "react-ace";
import { useState, useEffect } from 'react';
import { AVRRunner } from '../services/execute';
import classNames from 'classnames';

import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

export default function RGBControl() {
  const codeRGB = `// button pins
int btn[] = {2, 3, 4};
// RGB pins
int rgb[] = {9, 10, 11};

// connect elements to pins
void setup_rgb()
{
  for( int i = 0; i < sizeof( rgb ); i++ )
  {
    pinMode( btn[i], INPUT );
    pinMode( rgb[i], OUTPUT );
  }
}

void loop_rgb()
{
  // RED
  if( digitalRead( btn[0] ) == 1 )
  {
    set_color( 255, 0, 0 );
  }
  // GREEN
  else if( digitalRead( btn[1] ) == 1 )
  {
    set_color( 0, 255, 0 );
  }
  // BLUE
  else if( digitalRead( btn[2] ) == 1 )
  {
    set_color( 0, 0, 255 );
  }
}

// function to change rgb color
void set_color( int red, int green, int blue )
{
  analogWrite( rgb[0], red );
  analogWrite( rgb[1], green );
  analogWrite( rgb[2], blue );
}`

  const calculatedClassName = (color: string) => {
    return classNames('', {
      [styles.red]: color === 'red',
      [styles.green]: color === 'green',
      [styles.blue]: color === 'blue',
      [styles.off]: color === 'off',
    });
  };

  const [color, setColor] = useState('off');
  const [code, setCode] = useState(codeRGB);
  const [runner, setRunner] = useState<AVRRunner>(new AVRRunner());
  const [status, setStatus] = useState('');
  const [buildResult, setBuildResult] = useState('');
  const [hex, setHex] = useState(null);
  const [sketchName, setSketchName] = useState('sketch_rgb');

  const handleBuildAndUpload = async () => {
    setHex(null);
    try {
      const response = await fetch('http://localhost:8080/api/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          sketch: sketchName
        }),
      });
      if (response.ok) {
        const result = await response.json();
        setBuildResult(result.output);
        setHex(result.hex);
        setStatus(result.code == 0 ? 'Success' : 'Error');
      } else {
        console.error('Failed to build and upload:', response.statusText);
        setBuildResult('Failed to build and upload');
        setStatus('Error');
      }
    } catch (error) {
      console.error('Error during API call:', error);
      setBuildResult('Error during API call');
    }
  };

  const onChange = (newValue: string) => {
    setCode(newValue);
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
  };

  useEffect(() => {
    runner.stop();
    if (hex) {
      runner.uploadHex(hex || '');
      runner.execute(() => {});
    }
  }, [hex]);

  return (
    <main className={styles.main}>
      <AceEditor
        value={code}
        mode="c_cpp"
        theme="monokai"
        name="UNIQUE_ID_OF_DIV"
        onChange={onChange}
        editorProps={{ $blockScrolling: true }}
      />
      <button onClick={handleBuildAndUpload}>Build and Upload</button>
      
      <div className={calculatedClassName(color)}>RGB LED - {color.toUpperCase()}</div>
      
      <div>
        <button onClick={() => handleColorChange('red')}>Red</button>
        <button onClick={() => handleColorChange('green')}>Green</button>
        <button onClick={() => handleColorChange('blue')}>Blue</button>
      </div>

      <div>
        <h2>OUTPUT</h2>
        <h3>Status: {status} </h3>
        <div id="output">
          {buildResult}
        </div>
      </div>
    </main >
  );
}