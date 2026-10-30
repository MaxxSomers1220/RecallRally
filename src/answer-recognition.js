/* ANSWER_RECOGNITION_START */
// Conservative local matching. No network, microphone access, or saved-data changes.
const RallyAnswers=(()=>{
 const words=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[’']/g,'').replace(/[.,!?;:"“”()]/g,' ').replace(/\s+/g,' ').trim();
 const protectedWord=/^(?:no|not|never|non|without|except|least|less|more|plus|minus|positive|negative|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|first|second|third|fourth|fifth|half|quarter|percent|degrees?|meters?|metres?|centimeters?|kilometers?|grams?|kilograms?|liters?|litres?|seconds?|minutes?|hours?|celsius|fahrenheit|kelvin|newtons?|watts?|volts?|joules?|moles?|mol|cm|mm|km|kg|mg|ml)$/;
 function lexicon(bank){const vocabulary=new Set();for(const q of bank||[])for(const a of [q.answer,...q.aliases||[],...q.options||[]])for(const w of words(a).split(' '))vocabulary.add(w);return vocabulary}
 function distance(a,b){const d=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=0;i<=a.length;i++)d[i][0]=i;for(let j=0;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]!==b[j-1]));if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1)}return d[a.length][b.length]}
 function evaluate(raw,q,bank=[]){
  const original=String(raw??'').trim(),input=words(original),answers=[q.answer,...q.aliases||[]].filter(a=>typeof a==='string'&&a.trim());
  // Numeric answers retain every symbol, decimal point, fraction and unit.
  const literal=s=>String(s).normalize('NFKC').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
  // If choices differ only in case or punctuation, that distinction is the
  // academic task (for example girl's vs girls'), not harmless formatting.
  const formMatters=(q.options||[]).some(a=>!answers.some(b=>literal(b)===literal(a))&&answers.some(b=>words(b)===words(a)));
  const sensitive=a=>/[\d=+−–×÷/%°^<>]/.test(a)||q.subject==='science'&&(/^(?:[A-Z][a-z]?){1,6}$/.test(a)||/^(?:m|s|g|L|l|N|W|V|J|Pa|Hz|K)$/.test(a));
  const numeric=answers.some(sensitive);
  const exact=answers.find(a=>formMatters||sensitive(a)?literal(a)===literal(original):words(a)===input);
  if(exact)return {confidence:'high',interpretation:exact,reason:'exact'};
  const spellingTask=q.subject==='language'&&/\bspell(?:ing|ed)?\b/i.test((q.prompt||'')+' '+(q.topic||''));
  if(!input||numeric||formMatters||spellingTask||/[^a-z\s]/.test(input)||input.split(' ').some(w=>protectedWord.test(w)))return {confidence:'low'};
  // An actual distractor or a different known academic term is never a typo.
  if((q.options||[]).some(a=>!answers.some(x=>words(x)===words(a))&&words(a)===input))return {confidence:'low'};
  const known=lexicon(bank),candidates=[];
  for(const a of answers){const target=words(a),aa=input.split(' '),bb=target.split(' ');if(aa.length!==bb.length||/[^a-z\s]/.test(target))continue;
   const changed=aa.map((w,i)=>w===bb[i]?-1:i).filter(i=>i>=0);if(changed.length!==1)continue;
   const i=changed[0],from=aa[i],to=bb[i];if(protectedWord.test(to)||Math.min(from.length,to.length)<5||known.has(from))continue;
   const edits=distance(from,to);if(edits>1&&!(Math.min(from.length,to.length)>=9&&edits===2))continue;
   // A nearby distractor makes an interpretation ambiguous in meaning: reject.
   if((q.options||[]).some(x=>!answers.some(y=>words(y)===words(x))&&distance(input,words(x))<=edits))continue;
   const swapped=from.length===to.length&&[...from].filter((c,j)=>c!==to[j]).length===2&&edits===1;
   candidates.push({confidence:swapped&&to.length>=8?'high':'intermediate',interpretation:a,reason:'spelling',edits});
  }
  candidates.sort((a,b)=>a.edits-b.edits);
  if(!candidates.length)return {confidence:'low'};
  if(candidates.length>1&&candidates[0].edits===candidates[1].edits&&words(candidates[0].interpretation)!==words(candidates[1].interpretation))return {confidence:'low'};
  return candidates[0];
 }
 return {evaluate};
})();
/* ANSWER_RECOGNITION_END */
