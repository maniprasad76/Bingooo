export function PhonePeIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="24" r="24" fill="#5F259F" />
      <path
        d="M26.2 13H17.8c-.7 0-1.3.6-1.3 1.3v20.4c0 .5.4.9.9.9h3.4c.5 0 .9-.4.9-.9v-7h4.5c4.7 0 8.5-3.8 8.5-8.5s-3.8-6.2-8-6.2zm-.3 8.8h-4.2v-5.2h4.2c2.1 0 3.7 1.2 3.7 2.6s-1.6 2.6-3.7 2.6z"
        fill="#FFFFFF"
      />
      <path
        d="M22 28.5l9.2 10.3c.4.4 1 .5 1.4.1.4-.4.5-1 .1-1.4L24 28.5h-2z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function GooglePayIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="10" fill="#FFFFFF" />
      <rect width="46" height="46" x="1" y="1" rx="9" stroke="#E5E7EB" strokeWidth="1.5" />
      <g transform="translate(6, 11)">
        {/* Google 'G' */}
        <path
          d="M12.5 13.2v-3.7h9.2c.1.6.2 1.3.2 2 0 4.9-3.3 8.5-8.5 8.5-5 0-9-4-9-9s4-9 9-9c2.4 0 4.5.9 6.1 2.4l-2.6 2.6c-1-.9-2.2-1.5-3.5-1.5-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5c2.8 0 4.6-1.6 5-3.3h-5.9z"
          fill="#4285F4"
        />
        {/* Pay text */}
        <path
          d="M24.5 9.8c0 1.9-1.4 3.4-3.3 3.4h-1.6V7.2h1.6c1.9 0 3.3 1.2 3.3 2.6zm-1.8 0c0-.8-.7-1.3-1.6-1.3h-.7v2.6h.7c.9 0 1.6-.6 1.6-1.3zm7.8 2.2v-4.8h.9v4.8h-.9zm5.3.1l-.8-2.2c-.3-.8-.5-1.5-.7-2.3h-.1c-.2.7-.4 1.5-.7 2.3l-.8 2.2h3.1zm-4.7 2.1l3.2-8.3h1.1l3.3 8.3h-1.1l-.9-2.3h-3.6l-.9 2.3h-1.1z"
          fill="#5F6368"
        />
      </g>
    </svg>
  );
}

export function PaytmIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="10" fill="#002970" />
      <path
        d="M10 27.5V17.8h4.8c2.4 0 3.8 1.1 3.8 3.1 0 2-1.4 3.2-3.8 3.2h-2.3v3.4H10zm2.5-5.3h2c.9 0 1.6-.4 1.6-1.2 0-.8-.7-1.2-1.6-1.2h-2v2.4zm10.7 5.3v-1.8c-.5.8-1.4 1.2-2.4 1.2-1.8 0-3-1.2-3-2.9 0-1.8 1.4-2.8 3.2-2.8.7 0 1.5.2 2 .5v-.6c0-.9-.6-1.4-1.6-1.4-.7 0-1.4.3-1.9.8l-.8-1.2c.8-.8 1.8-1.2 3-1.2 2.1 0 3.4 1.2 3.4 3.3v6.1h-1.9zm-2.1-1.7c1 0 1.9-.7 2-1.7v-.4c-.4-.3-1-.5-1.6-.5-1.1 0-1.8.6-1.8 1.4 0 .8.6 1.2 1.4 1.2z"
        fill="#FFFFFF"
      />
      <path
        d="M27.2 30.5l1.6-4.6-2.9-8.1h2.2l1.8 5.6 1.7-5.6h2.2l-4.5 12.7h-2.1z"
        fill="#00BAF2"
      />
      <path
        d="M35 15.6h2.1v2.5H39v1.6h-1.9v4.6c0 .6.3.9.9.9h1v1.6h-1.6c-1.6 0-2.4-.9-2.4-2.4v-4.7H33v-1.6h2v-2.5z"
        fill="#00BAF2"
      />
    </svg>
  );
}

export function UpiIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="10" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
      <path d="M12 28L20 14h6l-8 14h-6z" fill="#097939" />
      <path d="M22 28L30 14h6l-8 14h-6z" fill="#ED752E" />
      <path d="M17 34h14v-3H17v3z" fill="#1E293B" />
    </svg>
  );
}
