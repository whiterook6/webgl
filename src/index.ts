import { Vector3Bezier} from "./Bezier";
import { Vector3 } from "./Vector3";

const bezier = Vector3Bezier.createFromMotion(new Vector3([0, 0, 0]), new Vector3([1, 0, 0]), new Vector3([10, 0, 0]), new Vector3([1, 0, 0]));
console.log(`Bezier: ${bezier}`);
for (let t = 0; t <= 1; t += 0.1){
  console.log(`Position at t=${t.toFixed(1)}: ${bezier.getPosition(t)}`);
  console.log(`Velocity at t=${t.toFixed(1)}: ${bezier.getVelocity(t)}`);
  console.log(`Acceleration at t=${t.toFixed(1)}: ${bezier.getAcceleration(t)}`);
}