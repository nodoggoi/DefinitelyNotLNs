import transferStudent from '../assets/transferstudent.png';

export default function Homepage() {
    return (
        <div className='bg-dark text-light '>
            <h2>Homepage</h2>
            <p>Welcome to the homepage!</p>
            <p>The below is a placeholder only</p>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                <div style={{ marginRight: '50px' }}>
                    <span
                        id='title'
                        style={{ fontSize: 'xx-large', fontWeight: 'bolder' }}>
                        &nbsp;After Coincidentally Saving the New Transfer
                        Student’s Little Sister, We Gradually Grew Closer&nbsp;
                    </span>
                    <p>
                        &nbsp;One day, a beautiful girl like a story - Charlotte
                        Bennett - came to study abroad in Akito's class. He is
                        attracted to her elegant appearance and cute demeanor
                        that fascinates everyone. However, Akito hesitates to
                        approach her because she seems out of reach.
                        Nevertheless, after saving Charlotte's lost sister, the
                        Bennett sisters start visiting Akito's room every day.
                        As they spend more time together, their attraction
                        grows, leading to a sweet, jittery, sugary life.&nbsp;
                    </p>
                </div>
                <img
                    src={transferStudent}
                    alt='Transfer Student LN'
                />
            </div>
        </div>
    );
}
