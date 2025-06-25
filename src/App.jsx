import {useState}   from 'react'
import {Calculator} from './calculator/calculator';
import                   './App.css';

function App() {
  const [height, setHeight] = useState('75')

  function handleSizeChange(evt) {
    setHeight(evt.currentTarget.value);
  }

  return <>
    <div className="size-controller">
      <label htmlFor="volume">Calculator Size:</label>
      <input type="range" min="40" max="90" step="0.5" value={height} onChange={handleSizeChange} />
    </div>
    <Calculator height={height + 'vh'} />
  </>;
}

export default App
