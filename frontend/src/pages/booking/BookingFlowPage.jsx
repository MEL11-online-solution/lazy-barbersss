import { useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import BookingStepper from '../../components/booking/BookingStepper';
import StepDetails from '../../components/booking/StepDetails';
import StepService from '../../components/booking/StepService';
import StepTime from '../../components/booking/StepTime';
import StepPayment from '../../components/booking/StepPayment';

export default function BookingFlowPage() {
  const { state, set, goToStep } = useBooking();
  const { user } = useAuth();

  // Stash the customer in the booking state once we know who they are
  useEffect(() => {
    if (user && !state.customer) set({ customer: user });
  }, [user, state.customer, set]);

  return (
    <section className="section-tight">
      <div className="container-page">
        <BookingStepper current={state.step} />

        {state.step === 1 && <StepDetails onNext={() => goToStep(2)} />}
        {state.step === 2 && (
          <StepService
            onBack={() => goToStep(1)}
            onNext={() => goToStep(3)}
          />
        )}
        {state.step === 3 && (
          <StepTime
            onBack={() => goToStep(2)}
            onNext={() => goToStep(4)}
          />
        )}
        {state.step === 4 && <StepPayment onBack={() => goToStep(3)} />}
      </div>
    </section>
  );
}
