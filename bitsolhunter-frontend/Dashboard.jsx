import ControlPanel from './components/ControlPanel';
import TokenList from './components/TokenList';
import TradeLog from './components/TradeLog';

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">BitsolHunter Dashboard</h1>

      {/* Control Panel Section */}
      <section className="bg-zinc-800 p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold">Control Panel</h2>
        <ControlPanel />
      </section>

      {/* Token List Section */}
      <section className="bg-zinc-800 p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold">Tracked Tokens</h2>
        <TokenList />
      </section>

      {/* Trade Log Section */}
      <section className="bg-zinc-800 p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold">Trade Log</h2>
        <TradeLog />
      </section>
    </div>
  );
}

