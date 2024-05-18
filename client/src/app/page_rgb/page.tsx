'use client';

import styles from "../page.module.css";
import AceEditor from "react-ace";
import { useState, useEffect } from 'react';
import { AVRRunner } from '../services/execute';
import classNames from 'classnames';

import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

export default function () {
  const codeRGB = `// pins
  int red = 4;
  int blue = 3;
  int green = 2;

  int btn = 1;
  bool first_color = true;

// elements connected to pins
  void setup_rgb()
  {
    pinMode(btn, INPUT);
    pinMode(red, OUTPUT);
    pinMode(blue, OUTPUT);
    pinMode(green, OUTPUT);
    analogWrite(red, 128);
    analogWrite(blue, 128);
    analogWrite(green, 0);
  }

  void loop_rgb()
  {
    if (digitalRead(btn) == 0)
    {
    }
    else if (digitalRead(btn) == 1)
    {
      if (first_color)
      {
        analogWrite(red, 0);
        analogWrite(blue, 128);
        analogWrite(green, 0);
        first_color = false;
      }
      else
      {
        analogWrite(red, 128);
        analogWrite(blue, 128);
        analogWrite(green, 0);
        first_color = true;
      }
      delay(100);
    }
  }`
 
  const [led, setLed] = useState(null);
  const [code, setCode] = useState(codeRGB);
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
        setLed({ color: 'red' }); // Initialize LED state after successful build and upload
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

  const toggleRGB = () => {
    if (led) {
      const nextColor = led.color === 'red' ? 'blue' : led.color === 'blue' ? 'green' : 'red';
      setLed({ color: nextColor });
    }
  };

  const onChange = (newValue: string) => {
    setCode(newValue);
  };

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

      {led ? (
        <>
          <div className={classNames(styles.led, {
            [styles.red]: led.color === 'red',
            [styles.blue]: led.color === 'blue',
            [styles.green]: led.color === 'green'
          })}>
            LED - {led.color.toUpperCase()}
          </div>

        <button onClick={toggleRGB}>Toggle RGB</button>
        </>
      ) : (
        <div>
          LED
        </div>
        )}

      <div>
        <h2>OUTPUT</h2>
        <h3>Status: {status}</h3>
        <div id="output">
          {buildResult}
        </div>
      </div>
    </main>
  );
};