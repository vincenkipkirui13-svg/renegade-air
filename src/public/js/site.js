const menuBtn=document.querySelector('[data-menu]');const nav=document.querySelector('[data-nav]');
if(menuBtn&&nav){menuBtn.setAttribute('aria-expanded','false');menuBtn.setAttribute('aria-label','Open navigation menu');menuBtn.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false')}))}
document.querySelectorAll('[data-destination]').forEach(a=>a.addEventListener('click',()=>{const s=document.querySelector('select[name="destination"]');if(s)s.value=a.dataset.destination}));
const requestedDestination=new URLSearchParams(window.location.search).get('destination');const destinationSelect=document.querySelector('select[name="destination"]');if(destinationSelect&&requestedDestination)destinationSelect.value=requestedDestination;
const depart=document.querySelector('[data-depart-date]');const tripType=document.querySelector('[data-trip-type]');const returnDate=document.querySelector('[data-return-date]');const originSelect=document.querySelector('select[name="origin"]');const syncRoute=()=>{if(!originSelect||!destinationSelect)return;Array.from(destinationSelect.options).forEach(o=>{o.disabled=!!o.value&&o.value===originSelect.value});if(destinationSelect.value===originSelect.value)destinationSelect.value=''};if(originSelect&&destinationSelect){originSelect.addEventListener('change',syncRoute);syncRoute()}
const now=new Date();const localToday=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
if(depart){depart.min=localToday;depart.addEventListener('change',()=>{if(returnDate){returnDate.min=depart.value||localToday;if(returnDate.value&&returnDate.value<returnDate.min)returnDate.value=''}})}
if(tripType&&returnDate){const syncTrip=()=>{const isReturn=tripType.value==='return';returnDate.disabled=!isReturn;returnDate.required=isReturn;if(!isReturn)returnDate.value=''};tripType.addEventListener('change',syncTrip);syncTrip()}
const seatPicker=document.querySelector('[data-seat-layout]');
if(seatPicker){
 const bookingForm=seatPicker.closest('form');
 const passengerInput=bookingForm&&bookingForm.querySelector('[data-passenger-count]');
 const seatSummary=bookingForm&&bookingForm.querySelector('[data-seat-summary]');
 const seatValue=bookingForm&&bookingForm.querySelector('[data-seat-entry]');
 let selectedSeats=[];
 const passengerCount=()=>Math.max(1,Math.min(9,Number(passengerInput&&passengerInput.value)||1));
 const parseSeatEntry=()=>{
  const raw=String(seatValue&&seatValue.value||'').toUpperCase();
  const parts=raw.split(',').map(value=>value.trim()).filter(Boolean);
  const valid=parts.every(seat=>/^([1-9]|1[0-2])[A-D]$/.test(seat))&&new Set(parts).size===parts.length;
  return {seats:valid?parts:[],valid,hasText:raw.trim().length>0};
 };
 const drawSeats=()=>{
  const count=passengerCount();
  seatPicker.replaceChildren();
  for(let row=1;row<=12;row++){
   const rowEl=document.createElement('div');rowEl.className='seat-row';
   const num=document.createElement('span');num.className='seat-row-number';num.textContent=String(row);rowEl.appendChild(num);
   ['A','B','C','D'].forEach(letter=>{
    const seat=row+letter;const chosen=selectedSeats.includes(seat);
    const button=document.createElement('button');
    button.type='button';button.className='seat-button'+(chosen?' is-selected':'')+(letter==='C'?' aisle-start':'');
    button.textContent=seat;button.dataset.seat=seat;
    button.disabled=!chosen&&selectedSeats.length>=count;
    button.setAttribute('aria-pressed',String(chosen));
    button.setAttribute('aria-label','Seat '+seat+(chosen?', selected':', available'));
    button.addEventListener('click',event=>{
     event.preventDefault();
     const index=selectedSeats.indexOf(seat);
     if(index>=0) selectedSeats.splice(index,1);
     else if(selectedSeats.length<count) selectedSeats.push(seat);
     if(seatValue)seatValue.value=selectedSeats.join(', ');
     drawSeats();
    });
    rowEl.appendChild(button);
   });
   seatPicker.appendChild(rowEl);
  }
  if(seatSummary){
   const parsed=parseSeatEntry();
   const message=!parsed.valid&&parsed.hasText?'Enter valid seat codes (1A–12D), separated by commas.':'Selected: '+(selectedSeats.length?selectedSeats.join(', '):'none yet')+' ('+selectedSeats.length+' of '+count+')';
   seatSummary.textContent=message;
   seatSummary.classList.toggle('is-invalid',!parsed.valid&&parsed.hasText);
  }
 };
 const syncFromManualEntry=()=>{
  if(seatValue)seatValue.value=seatValue.value.toUpperCase();
  const parsed=parseSeatEntry();
  selectedSeats=parsed.seats;
  drawSeats();
 };
 if(seatValue){
  seatValue.addEventListener('input',syncFromManualEntry);
  seatValue.addEventListener('change',syncFromManualEntry);
  seatValue.addEventListener('blur',syncFromManualEntry);
 }
 if(passengerInput)passengerInput.addEventListener('input',drawSeats);
 if(bookingForm)bookingForm.addEventListener('submit',e=>{
  const parsed=parseSeatEntry();
  selectedSeats=parsed.seats;
  if(!parsed.valid||selectedSeats.length!==passengerCount()){
   e.preventDefault();e.stopImmediatePropagation();
   const status=bookingForm.querySelector('[data-book-status]');
   const message=!parsed.valid?'Please enter valid seat codes such as 1A or 2C, separated by commas.':'Please enter exactly '+passengerCount()+' seat position'+(passengerCount()===1?'':'s')+' before sending your booking request.';
   if(status){status.className='booking-status is-error';status.textContent=message;status.hidden=false;status.scrollIntoView({behavior:'smooth',block:'nearest'});}
   if(seatValue)seatValue.focus();
  }
 });
 syncFromManualEntry();
}
const booking=document.querySelector('[data-booking]');if(booking){booking.addEventListener('submit',async e=>{e.preventDefault();const obj=Object.fromEntries(new FormData(booking).entries());const chosenSeats=String(obj.preferred_seats||'').split(',').filter(Boolean);if(chosenSeats.length!==Number(obj.passengers)){const status=booking.querySelector('[data-book-status]');if(status){status.className='booking-status is-error';status.textContent='Please select one seat for each passenger before sending your booking request.';status.hidden=false;status.scrollIntoView({behavior:'smooth',block:'nearest'})}return;}const status=booking.querySelector('[data-book-status]');const submit=booking.querySelector('button[type="submit"]');const showStatus=(kind,message)=>{status.className='booking-status is-'+kind;status.textContent=message;status.hidden=false;status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.scrollIntoView({behavior:'smooth',block:'nearest'})};const formatBookingMessage=()=>{const trip=obj.trip_type==='return'?'Return trip':'One way';return ['RENEGADE AIR — NEW FLIGHT BOOKING REQUEST','', 'Passenger: '+obj.name,'Phone: '+obj.phone,'Email: '+(obj.email||'Not provided'),'From: '+(obj.origin||'Nairobi Wilson Airport (WIL)'),'Destination: '+obj.destination,'Departure date: '+obj.travel_date,'Departure time: '+obj.departure_time,'Trip type: '+trip,...(obj.trip_type==='return'?['Return route: '+obj.destination+' → '+obj.origin,'Return date: '+(obj.return_date||'Not provided')]:[]),'Passengers: '+obj.passengers,'Preferred seats: '+(obj.preferred_seats||'No preference'),'Additional information: '+(obj.message||'None')].join('\n')};showStatus('pending','Sending your booking request… Please wait.');if(submit){submit.disabled=true;submit.textContent='Sending request…'}try{const r=await fetch('/booking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(obj)});const raw=await r.text();let result={};try{result=raw?JSON.parse(raw):{}}catch{}if(r.ok&&result.ok===true){booking.reset();if(depart)depart.min=localToday;if(returnDate){returnDate.disabled=true;returnDate.required=false;returnDate.min=localToday}showStatus('success','✓ Booking request saved successfully. Opening the WhatsApp app with your booking details. Your flight is not confirmed until our team confirms availability and fare.');const phone=String(booking.dataset.whatsapp||'').replace(/[^0-9]/g,'');const message=encodeURIComponent(formatBookingMessage());const appUrl='whatsapp://send?phone='+phone+'&text='+message;window.location.href=appUrl;const fallback=document.createElement('a');fallback.className='btn btn-primary';fallback.href='https://wa.me/'+phone+'?text='+message;fallback.target='_blank';fallback.rel='noopener';fallback.textContent='If WhatsApp did not open, tap here';fallback.style.display='inline-flex';fallback.style.justifyContent='center';fallback.style.marginTop='10px';status.insertAdjacentElement('afterend',fallback)}else{showStatus('error','✕ Your booking request was not saved. '+(result.message||raw||'Please check your details and try again, or call or WhatsApp Renegade Air.'))}}catch(error){showStatus('error','✕ We could not confirm that your request was saved because of a connection problem. Please try again, or call or WhatsApp Renegade Air.')}finally{if(submit){submit.disabled=false;submit.innerHTML='Send booking request <span aria-hidden="true">→</span>'}}})}