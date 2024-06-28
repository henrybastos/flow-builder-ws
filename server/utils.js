// function fillGaps (value) {
//    if (typeof value == 'object') {
//       if (Array.isArray(value)) {
//          for (let v of value) {
//             fillGaps(v);
//             // console.log(`Array::Value: ${v}`);
//          }
//       } else {
//          fillGaps(Object.entries(value));
//          // for (let [k, v] of Object.entries(value)) {
//          //    console.log(`Object::Key: ${k} // Object::Value: ${v}`);
//          // }
//       }
//    } else {
//       console.log(`Value: ${value}`);
//    }
// }

// fillGaps(obj);

export function fillGaps(source, fullPath, filler) {
   filler = typeof filler == 'object' ? JSON.stringify(filler) : filler;
   const srcClone = structuredClone(source);
   fullPath = `srcClone.${fullPath}`;
   srcClone
   fullPath.split('.').reduce((acc, cur, idx, src) => {
      const path = `${acc}['${cur}']`;
      return eval(path) 
         ? path 
         : !(idx + 1 == src.length)
            ? (eval(`${path} = {}`), path)
            : eval(`${path} = '${filler}'`)
   })
   return srcClone;
}

function test () {
   const obj = {
      a: 1,
      b: 2,
      c: {
         c1: 'C1',
         c2: 'C2',
         c3: {
            c3A: 'C3A',
            c3B: 'C3B'
         }
      }
   }

   // Already exists. Will not modify it
   fillGaps(obj, `obj.c.c3.c3B`, 'c3BB');
   fillGaps(obj, `obj.c.c3.c3C`, 'C3C');
   fillGaps(obj, `obj.c.c3.c3D.c3DI.c3DI+`, 'C3DI-Plus');

   console.dir(obj, { depth: null });
}

// test();