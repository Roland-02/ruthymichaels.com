import React from 'react';
import Navbar from '../../../client/src/components/common/Navbar';
import Footer from '../../../client/src/components/common/footer';

const Index = ({ session }) => {
  return (
    <div>
      <Navbar session={session} />
      <main>

        {/* Your index page content */}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
