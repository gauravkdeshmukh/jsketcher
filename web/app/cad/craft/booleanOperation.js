import {subtract, union, intersect} from '../../brep/operations/boolean'
import {update as updateStitching} from '../../brep/stitching'
import {BREPValidator} from '../../brep/brep-validator'
import {Shell} from '../../brep/topo/shell'
import {MShell} from '../model/mshell';

const BoolOpMap = {
  'subtract': subtract,
  'union': union,
  'intersect': intersect
};

export function BooleanOperation(face, solid, operand, operationType) {
  let result;
 if (solid instanceof MShell) {
   const op = BoolOpMap[operationType];
   result = op(solid.shell, operand);
   for (let newFace of result.faces) {
     if (newFace.id === face.id) {
       newFace.id = undefined;
     }
   }
 } else {
   if (operationType !== 'union') throw 'unable to cut plane';
   result = operand;
 }
 updateStitching(result);
  const newSolid = new MShell(result);
  return {
    outdated: [solid],
    created:  [newSolid]
  }
}

export function combineShells(shells) {
  if (shells.length === 1) {
    return shells[0];
  }
  const operand = new Shell();
  shells.forEach(c => c.faces.forEach(f => operand.faces.push(f)));
  // operand.faces.forEach(f => f.shell = operand);
  BREPValidator.validateToConsole(operand);
  return operand;
}
