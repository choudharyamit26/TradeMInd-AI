import React, { useState } from 'react';
import { Star, Trash2, Plus, TrendingUp, Layers, List, Check, BarChart4, PieChart, Globe, Search, X } from 'lucide-react';

interface WatchlistPanelProps {
  watchlist: string[];
  onRemove: (symbol: string) => void;
  onAdd: (symbol: string) => void;
  onSelect: (symbol: string) => void;
  tradingMode: string;
}

// --- DATA DEFINITIONS ---

const INDICES = [
  "NIFTY 50", "BANKNIFTY", "FINNIFTY", "SENSEX", "INDIA VIX",
  "NIFTY MIDCAP 100", "NIFTY SMALLCAP 100", "NIFTY NEXT 50",
  "NIFTY IT", "NIFTY AUTO", "NIFTY METAL", "NIFTY PHARMA", 
  "NIFTY FMCG", "NIFTY ENERGY", "NIFTY PSU BANK", "NIFTY PVT BANK",
  "NIFTY REALTY", "NIFTY MEDIA", "NIFTY INFRA", "NIFTY COMMODITIES"
];

const NIFTY_50 = [
  "ADANIENT", "ADANIPORTS", "APOLLOHOSP", "ASIANPAINT", "AXISBANK",
  "BAJAJ-AUTO", "BAJFINANCE", "BAJAJFINSV", "BEL", "BHARTIARTL",
  "BPCL", "BRITANNIA", "CIPLA", "COALINDIA", "DIVISLAB",
  "DRREDDY", "EICHERMOT", "GRASIM", "HCLTECH", "HDFCBANK",
  "HDFCLIFE", "HEROMOTOCO", "HINDALCO", "HINDUNILVR", "ICICIBANK",
  "INDUSINDBK", "INFY", "ITC", "JSWSTEEL", "KOTAKBANK",
  "LT", "LTIM", "M&M", "MARUTI", "NESTLEIND",
  "NTPC", "ONGC", "POWERGRID", "RELIANCE", "SBILIFE",
  "SBIN", "SHRIRAMFIN", "SUNPHARMA", "TATACONSUM", "TATAMOTORS",
  "TATASTEEL", "TCS", "TECHM", "TITAN", "TRENT",
  "ULTRACEMCO", "WIPRO"
];

const NIFTY_NEXT_50 = [
  "ABB", "ADANIENSOL", "ADANIGREEN", "ADANIPOWER", "ATGL", "AMBUJACEM", 
  "BANKBARODA", "BERGEPAINT", "BHEL", "BOSCHLTD", "CANBK", "CHOLAFIN", 
  "COLPAL", "DLF", "DMART", "GAIL", "GODREJCP", "HAL", "HAVELLS", 
  "HDFCAMC", "HINDPETRO", "ICICIGI", "ICICIPRULI", "IOC", "IRCTC", 
  "JINDALSTEL", "JIOFIN", "JSWINFRA", "LICI", "LUPIN", "MARICO", 
  "MOTHERSON", "NAUKRI", "PIDILITIND", "PNB", "PFC", "PGHH", "PIIND", 
  "RECLTD", "SBICARD", "SHREECEM", "SIEMENS", "SRF", "TORNTPHARM", 
  "TVSMOTOR", "UBL", "UNITEDSPIRITS", "VEDL", "ZOMATO", "ZYDUSLIFE"
];

const MIDCAP_SELECT = [
    "ACC", "APLAPOLLO", "ASTRAL", "AUROPHARMA", "BALKRISIND", "BHARATFORG", 
    "CUMMINSIND", "FEDERALBNK", "INDHOTEL", "MPHASIS", "MRF", "OFSS", 
    "PAGEIND", "PETRONET", "POLYCAB", "TATACOMM", "VOLTAS", "ASHOKLEY", 
    "BALRAMCHIN", "BANDHANBNK", "BANKINDIA", "BATAINDIA", "COFORGE", 
    "CONCOR", "COROMANDEL", "CROMPTON", "DALBHARAT", "DEEPAKNTR", 
    "DELTACORP", "ESCORTS", "FORTIS", "GLENMARK", "GMRINFRA", "GODREJPROP", 
    "GRANULES", "GUJGASLTD", "HAPPSTMNDS", "HINDCOPPER", "IDFCFIRSTB", 
    "IGL", "INDIGOPNTS", "IPCALAB", "JSL", "JUBLFOOD", "LALPATHLAB", 
    "LAURUSLABS", "L&TFH", "MANAPPURAM", "MFSL", "M&MFIN", "NAM-INDIA", 
    "NATIONALUM", "NAVINFLUOR", "OBEROIRLTY", "PERSISTENT", "PVRINOX", 
    "RAIN", "RAMCOCEM", "RBLBANK", "SAIL", "SUNTV", "SYNGENE", "TATACHEM", 
    "TATAPOWER", "TATAELXSI", "JKCEMENT", "KAJARIACER", "KEI"
];

const SMALLCAP_SELECT = [
  "ALOKINDS", "AMBER", "ANGELONE", "ANURAS", "ASTERDM", "AVANTIFEED", "BASF",
  "BCG", "BEML", "BIRLACORPN", "BLS", "BLUESTARCO", "BORORENEW", "BSE", "BSOFT",
  "CAMPUS", "CAMS", "CASTROLIND", "CDSL", "CENTURYPLY", "CESC", "CHAMBLFERT",
  "CHEMPLASTS", "CHOLAHLDNG", "CIEINDIA", "CREDITACC", "CYIENT", "DATAPATTNS",
  "DCMSHRIRAM", "DEEPAKFERT", "DEVYANI", "ECLERX", "EIDPARRY", "EIHOTEL",
  "ELGIEQUIP", "ENDURANCE", "ENGINERSIN", "EPL", "EQUITASBNK", "ERIS", "EXIDEIND",
  "FSL", "GLS", "GMMPFAUDLR", "GNFC", "GODFRYPHLP", "GPPL", "GRAPHITE", "GRINDWELL",
  "GSFC", "GSPL", "HEG", "HFCL", "HIKAL", "HINDZINC", "HITACHI", "HONAUT",
  "HSCL", "HUDCO", "IEX", "IDBI", "IDFC", "IIFL", "INDDIAM", "INDIAMART",
  "INDIANB", "INDIGOREM", "INTELLECT", "IOB", "IRFC", "IRCON", "ITI", "J&KBANK",
  "JBCHEPHARM", "JINDALSAW", "JKLAKSHMI", "JKPAPER", "JKTYRE", "JYOTHYLAB",
  "KALYANKJIL", "KARURVYSYA", "KEC", "KNRCON", "KPITTECH", "KRBL", "KSB",
  "LATENTVIEW", "LAXMIMACH", "LEMONTREE", "LICHSGFIN", "LINDEINDIA", "MAHABANK",
  "MAHLIFE", "MANINFRA", "MAPMYINDIA", "MASTEK", "MAZAGONDOC", "MCX", "METROPOLIS",
  "MGL", "MMTC", "MOIL", "MRPL", "MSTCLTD", "MTARTECH", "NBCC", "NCC", "NH",
  "NHPC", "NLCINDIA", "NMDC", "NSL", "NUVAMA", "OLECTRA", "OIL", "PATANJALI",
  "PPLPHARMA", "PRAJIND", "PRESTIGE", "PRINCEPIPE", "PRISMJOHN", "QUESS",
  "RADICO", "RAILTEL", "RAJESHEXPO", "RATNAMANI", "RAYMOND", "RCF", "REDINGTON",
  "RENUKA", "RHIM", "RITES", "ROSSARI", "ROUTE", "RVNL", "SAPPHIRE", "SCI",
  "SHYAMMETL", "SJVN", "SKFINDIA", "SOBHA", "SONACOMS", "STARHEALTH", "STLTECH",
  "SUMICHEM", "SUNDARMFIN", "SUNDRMFAST", "SUNTECK", "SUPRAJIT", "SUZLON",
  "SWANENERGY", "TANLA", "TATAINVEST", "TEJASNET", "TITAGARH", "TRITURBINE",
  "TRIVENI", "UCOBANK", "UNIONBANK", "UTIAMC", "VAIBHAVGBL", "VAKRANGEE",
  "VARROC", "VGUARD", "VIPIND", "WELCORP", "WELSPUNLIV", "WESTLIFE", "WHIRLPOOL",
  "YESBANK", "ZENSARTECH"
];

const NIFTY_100 = [...NIFTY_50, ...NIFTY_NEXT_50].sort();
const NIFTY_200 = [...NIFTY_100, ...MIDCAP_SELECT].sort();
const NIFTY_500 = [...NIFTY_200, ...SMALLCAP_SELECT].sort();

type Tab = 'saved' | 'indices' | 'stocks' | 'nifty100' | 'nifty200' | 'nifty500';

export const WatchlistPanel: React.FC<WatchlistPanelProps> = ({
  watchlist,
  onRemove,
  onAdd,
  onSelect,
  tradingMode
}) => {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const [filter, setFilter] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAdd(input.toUpperCase());
      setInput('');
    }
  };

  const getDisplayList = () => {
    let list: string[] = [];
    if (activeTab === 'saved') list = watchlist;
    else if (activeTab === 'indices') list = INDICES;
    else if (activeTab === 'stocks') list = NIFTY_50;
    else if (activeTab === 'nifty100') list = NIFTY_100;
    else if (activeTab === 'nifty200') list = NIFTY_200;
    else if (activeTab === 'nifty500') list = NIFTY_500;

    if (filter) {
      return list.filter(item => item.toLowerCase().includes(filter.toLowerCase()));
    }
    return list;
  };

  const displayList = getDisplayList();

  const TabButton = ({ id, label, icon: Icon, colorClass }: { id: Tab, label: string, icon: any, colorClass: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative w-full flex flex-col items-center justify-center gap-1 py-3 px-1 transition-all duration-200 group ${
        activeTab === id 
          ? 'text-white' 
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
      }`}
    >
      {activeTab === id && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 rounded-r-full" />
      )}
      <div className={`p-2 rounded-lg transition-all ${activeTab === id ? 'bg-slate-800 shadow-md ring-1 ring-slate-700' : ''}`}>
        <Icon size={18} className={activeTab === id ? colorClass : ''} />
      </div>
      <span className="text-[9px] font-medium tracking-wide opacity-80">{label}</span>
    </button>
  );

  return (
    <div className="w-full md:w-80 flex-none bg-slate-950 border-l border-slate-800 flex h-full backdrop-blur-sm overflow-hidden">
      
      {/* Left Navigation Rail */}
      <div className="w-[72px] flex-none flex flex-col items-center bg-slate-950 border-r border-slate-800 py-2 gap-1 z-10">
        <div className="mb-2 p-2">
           <Layers className="text-emerald-500 w-6 h-6" />
        </div>
        <div className="flex-1 w-full flex flex-col gap-1 overflow-y-auto scrollbar-none">
          <TabButton id="saved" label="Saved" icon={Star} colorClass="text-yellow-400" />
          <TabButton id="indices" label="Indices" icon={BarChart4} colorClass="text-blue-400" />
          <TabButton id="stocks" label="Nifty 50" icon={List} colorClass="text-emerald-400" />
          <TabButton id="nifty100" label="Top 100" icon={PieChart} colorClass="text-purple-400" />
          <TabButton id="nifty200" label="Top 200" icon={TrendingUp} colorClass="text-orange-400" />
          <TabButton id="nifty500" label="All 500" icon={Globe} colorClass="text-indigo-400" />
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/30">
        
        {/* Header & Search */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
           <div className="flex items-center justify-between mb-2">
             <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
               {activeTab === 'saved' ? 'My Watchlist' : activeTab.replace('nifty', 'Nifty ').replace('stocks', 'Nifty 50').toUpperCase()}
             </h3>
             <span className="text-[10px] text-emerald-500/80 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
               {displayList.length}
             </span>
           </div>

           <form onSubmit={handleSubmit} className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="text"
              value={activeTab === 'saved' ? input : filter}
              onChange={(e) => activeTab === 'saved' ? setInput(e.target.value) : setFilter(e.target.value)}
              placeholder={activeTab === 'saved' ? "Add Symbol..." : "Filter..."}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-8 pr-8 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 transition-all shadow-inner"
            />
            {(activeTab === 'saved' ? input : filter) && (
              <button 
                type="button"
                onClick={() => activeTab === 'saved' ? setInput('') : setFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={12} />
              </button>
            )}
            {activeTab === 'saved' && input && (
              <button 
                 type="submit"
                 className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-300 hidden group-focus-within:block"
              >
                <Plus size={14} />
              </button>
            )}
          </form>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {displayList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
              <div className="p-3 bg-slate-800/50 rounded-full mb-2">
                <Search size={18} />
              </div>
              <p className="text-xs">No symbols found</p>
            </div>
          ) : (
            displayList.map((symbol) => {
              const isSaved = watchlist.includes(symbol);
              return (
                <div 
                  key={symbol}
                  className="group flex items-center justify-between p-2 rounded-md bg-slate-800/40 border border-transparent hover:border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
                  onClick={() => onSelect(symbol)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-1 h-8 rounded-full ${
                       activeTab === 'indices' ? 'bg-blue-500' : 
                       activeTab === 'stocks' ? 'bg-emerald-500' : 
                       activeTab === 'saved' ? 'bg-yellow-500' :
                       'bg-slate-600'
                    } opacity-40 group-hover:opacity-100 transition-opacity`} />
                    
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-300 group-hover:text-white truncate">{symbol}</div>
                      <div className="text-[9px] text-slate-500 group-hover:text-emerald-400/80 flex items-center gap-1">
                        Click to analyze
                      </div>
                    </div>
                  </div>
                  
                  {activeTab === 'saved' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(symbol);
                      }}
                      className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSaved) onAdd(symbol);
                        else onRemove(symbol);
                      }}
                      className={`p-1.5 rounded-md transition-all ${
                        isSaved 
                          ? 'text-yellow-400 bg-yellow-400/10 opacity-100' 
                          : 'text-slate-600 hover:text-white hover:bg-slate-700 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isSaved ? <Check size={13} /> : <Plus size={13} />}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        {/* Footer Info */}
        <div className="p-2 border-t border-slate-800 bg-slate-950 text-center">
          <p className="text-[9px] text-slate-600 font-medium">
             Mode: <span className={tradingMode === 'INTRADAY' ? "text-blue-400" : "text-emerald-400"}>{tradingMode}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
