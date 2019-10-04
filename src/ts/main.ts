import '../sass/style.sass';
import Person from './components/sub';

const add = (a: number, b: number): number => {
  return a + b;
};

console.log(add(1, 10));

const john = new Person('John');

console.log(john);
