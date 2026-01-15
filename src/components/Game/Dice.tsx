import styles from './Dice.module.css';

interface DiceProps {
  value: number; // 1-6
  size?: 'small' | 'medium' | 'large';
}

export function Dice({ value, size = 'medium' }: DiceProps) {
  const renderDots = () => {
    const dots: JSX.Element[] = [];

    // Точки для каждого значения
    const dotPositions: { [key: number]: string[] } = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
    };

    const positions = dotPositions[value] || [];

    positions.forEach((position, index) => {
      dots.push(<div key={index} className={`${styles.dot} ${styles[position]}`} />);
    });

    return dots;
  };

  return (
    <div className={`${styles.dice} ${styles[size]}`}>
      {renderDots()}
    </div>
  );
}
