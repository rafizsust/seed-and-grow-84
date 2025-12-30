import { cn } from '@/lib/utils';

// Chart data types for different visual types
export interface ChartDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface LineDataPoint {
  x: string | number;
  y: number;
}

export interface LineSeriesData {
  name: string;
  data: LineDataPoint[];
  color?: string;
}

export interface TableCell {
  value: string | number;
  isHeader?: boolean;
}

export interface ProcessStep {
  label: string;
  description?: string;
}

export interface MapFeature {
  label: string;
  type: 'building' | 'road' | 'park' | 'water' | 'other';
  position?: string;
}

export interface MapData {
  before?: { year: string; features: MapFeature[] };
  after?: { year: string; features: MapFeature[] };
  features?: MapFeature[];
}

// Main chart data interface
export interface IELTSChartData {
  type: 'BAR_CHART' | 'LINE_GRAPH' | 'PIE_CHART' | 'TABLE' | 'PROCESS_DIAGRAM' | 'MAP' | 'MIXED_CHARTS';
  title: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  data?: ChartDataItem[];
  series?: LineSeriesData[];
  rows?: TableCell[][];
  headers?: string[];
  steps?: ProcessStep[];
  mapData?: MapData;
  charts?: IELTSChartData[]; // For mixed charts
}

// Default colors for charts
const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(200 70% 50%)',
  'hsl(150 60% 45%)',
  'hsl(30 80% 55%)',
  'hsl(280 60% 55%)',
  'hsl(0 70% 55%)',
];

interface IELTSVisualRendererProps {
  chartData: IELTSChartData | null | undefined;
  fallbackDescription?: string;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Renders IELTS Task 1 visuals from JSON data using CSS.
 * Handles: Bar Charts, Line Graphs, Pie Charts, Tables, Process Diagrams, Maps, Mixed Charts
 */
export function IELTSVisualRenderer({
  chartData,
  fallbackDescription = 'Visual data not available',
  className = '',
  maxWidth = 600,
  maxHeight = 400,
}: IELTSVisualRendererProps) {
  
  // Show placeholder if no data
  if (!chartData || !chartData.type) {
    return (
      <div 
        className={cn(
          'flex flex-col items-center justify-center p-6 bg-muted/30 border border-border rounded-lg text-center',
          className
        )}
        style={{ maxWidth, minHeight: 200 }}
      >
        <div className="text-muted-foreground text-sm mb-2">📊</div>
        <p className="text-sm text-muted-foreground">{fallbackDescription}</p>
      </div>
    );
  }

  const getColor = (index: number, customColor?: string) => 
    customColor || CHART_COLORS[index % CHART_COLORS.length];

  // Render based on chart type
  const renderChart = () => {
    switch (chartData.type) {
      case 'BAR_CHART':
        return <BarChartRenderer data={chartData} getColor={getColor} />;
      case 'LINE_GRAPH':
        return <LineGraphRenderer data={chartData} getColor={getColor} />;
      case 'PIE_CHART':
        return <PieChartRenderer data={chartData} getColor={getColor} />;
      case 'TABLE':
        return <TableRenderer data={chartData} />;
      case 'PROCESS_DIAGRAM':
        return <ProcessDiagramRenderer data={chartData} />;
      case 'MAP':
        return <MapRenderer data={chartData} />;
      case 'MIXED_CHARTS':
        return <MixedChartsRenderer data={chartData} getColor={getColor} />;
      default:
        return (
          <div className="text-center text-muted-foreground p-4">
            <p>Unknown chart type: {chartData.type}</p>
            <p className="text-xs mt-2">{fallbackDescription}</p>
          </div>
        );
    }
  };

  return (
    <div 
      className={cn('bg-background border border-border rounded-lg p-4', className)}
      style={{ maxWidth, maxHeight: maxHeight === 400 ? 'auto' : maxHeight }}
    >
      {chartData.title && (
        <h3 className="text-base font-semibold text-center mb-1 text-foreground">
          {chartData.title}
        </h3>
      )}
      {chartData.subtitle && (
        <p className="text-xs text-muted-foreground text-center mb-3">
          {chartData.subtitle}
        </p>
      )}
      {renderChart()}
    </div>
  );
}

// Bar Chart Renderer
function BarChartRenderer({ 
  data, 
  getColor 
}: { 
  data: IELTSChartData; 
  getColor: (index: number, color?: string) => string;
}) {
  const items = data.data || [];
  const maxValue = Math.max(...items.map(d => d.value), 1);

  return (
    <div className="space-y-3">
      {/* Y-axis label */}
      {data.yAxisLabel && (
        <div className="text-xs text-muted-foreground text-center">{data.yAxisLabel}</div>
      )}
      
      {/* Bars */}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20 truncate text-right">
              {item.label}
            </span>
            <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden">
              <div 
                className="h-full rounded transition-all duration-300"
                style={{ 
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: getColor(idx, item.color),
                }}
              />
            </div>
            <span className="text-xs font-medium w-12 text-foreground">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* X-axis label */}
      {data.xAxisLabel && (
        <div className="text-xs text-muted-foreground text-center mt-2">{data.xAxisLabel}</div>
      )}
    </div>
  );
}

// Line Graph Renderer (simplified as connected data points)
function LineGraphRenderer({
  data,
  getColor,
}: {
  data: IELTSChartData;
  getColor: (index: number, color?: string) => string;
}) {
  const series = data.series || [];
  
  // Calculate bounds
  const allYValues = series.flatMap(s => s.data.map(d => d.y));
  const maxY = Math.max(...allYValues, 1);
  const minY = Math.min(...allYValues, 0);
  const range = maxY - minY || 1;

  // Get all x labels
  const xLabels = series[0]?.data.map(d => String(d.x)) || [];

  return (
    <div className="space-y-3">
      {data.yAxisLabel && (
        <div className="text-xs text-muted-foreground">{data.yAxisLabel}</div>
      )}
      
      {/* Chart area */}
      <div className="relative h-48 border-l border-b border-border pl-8 pb-6">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
          <span>{maxY}</span>
          <span>{Math.round((maxY + minY) / 2)}</span>
          <span>{minY}</span>
        </div>

        {/* Data points and lines */}
        <div className="h-full flex items-end justify-between px-2">
        {xLabels.map((_, xIdx) => (
          <div key={xIdx} className="flex flex-col items-center gap-1">
              {series.map((s, sIdx) => {
                const point = s.data[xIdx];
                if (!point) return null;
                const height = ((point.y - minY) / range) * 100;
                return (
                  <div
                    key={sIdx}
                    className="w-3 h-3 rounded-full border-2 border-background"
                    style={{ 
                      backgroundColor: getColor(sIdx, s.color),
                      marginBottom: `${height}%`,
                      position: 'absolute',
                      bottom: `${height}%`,
                    }}
                    title={`${s.name}: ${point.y}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-muted-foreground">
          {xLabels.map((label, idx) => (
            <span key={idx} className="truncate max-w-16">{label}</span>
          ))}
        </div>
      </div>

      {/* Legend */}
      {series.length > 1 && (
        <div className="flex flex-wrap gap-3 justify-center">
          {series.map((s, idx) => (
            <div key={idx} className="flex items-center gap-1 text-xs">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getColor(idx, s.color) }}
              />
              <span className="text-muted-foreground">{s.name}</span>
            </div>
          ))}
        </div>
      )}

      {data.xAxisLabel && (
        <div className="text-xs text-muted-foreground text-center">{data.xAxisLabel}</div>
      )}
    </div>
  );
}

// Pie Chart Renderer
function PieChartRenderer({
  data,
  getColor,
}: {
  data: IELTSChartData;
  getColor: (index: number, color?: string) => string;
}) {
  const items = data.data || [];
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;

  // Calculate segment angles
  let currentAngle = 0;
  const segments = items.map((item, idx) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const segment = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      color: getColor(idx, item.color),
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pie visual using conic gradient */}
      <div 
        className="w-40 h-40 rounded-full"
        style={{
        background: `conic-gradient(${segments.map(
            (s) => `${s.color} ${s.startAngle}deg ${s.endAngle}deg`
          ).join(', ')})`,
        }}
      />

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {segments.map((segment, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div 
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-muted-foreground truncate">
              {segment.label}: {segment.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Table Renderer
function TableRenderer({ data }: { data: IELTSChartData }) {
  const headers = data.headers || [];
  const rows = data.rows || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((header, idx) => (
                <th 
                  key={idx}
                  className="bg-muted/50 border border-border px-2 py-1.5 text-left font-medium text-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, cellIdx) => (
                <td 
                  key={cellIdx}
                  className={cn(
                    'border border-border px-2 py-1.5',
                    cell.isHeader ? 'bg-muted/30 font-medium' : 'bg-background'
                  )}
                >
                  {cell.value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Process Diagram Renderer
function ProcessDiagramRenderer({ data }: { data: IELTSChartData }) {
  const steps = data.steps || [];

  return (
    <div className="flex flex-col gap-2">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {/* Step box */}
          <div className="flex-1 bg-muted/30 border border-border rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {idx + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{step.label}</span>
            </div>
            {step.description && (
              <p className="text-xs text-muted-foreground mt-1 pl-8">{step.description}</p>
            )}
          </div>
          
          {/* Arrow (except for last step) */}
          {idx < steps.length - 1 && (
            <div className="text-muted-foreground text-lg">↓</div>
          )}
        </div>
      ))}
    </div>
  );
}

// Map Renderer (simplified list view)
function MapRenderer({ data }: { data: IELTSChartData }) {
  const mapData = data.mapData;
  
  if (!mapData) {
    return <div className="text-center text-muted-foreground text-sm">Map data not available</div>;
  }

  const renderFeatures = (features: MapFeature[], year?: string) => (
    <div className="flex-1 bg-muted/20 border border-border rounded-lg p-3">
      {year && (
        <div className="text-xs font-semibold text-primary mb-2 text-center">{year}</div>
      )}
      <div className="space-y-1">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className={cn(
              'w-2 h-2 rounded-sm',
              feature.type === 'building' && 'bg-amber-500',
              feature.type === 'road' && 'bg-slate-500',
              feature.type === 'park' && 'bg-green-500',
              feature.type === 'water' && 'bg-blue-500',
              feature.type === 'other' && 'bg-gray-400',
            )} />
            <span className="text-foreground">{feature.label}</span>
            {feature.position && (
              <span className="text-muted-foreground">({feature.position})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Side-by-side comparison if before/after exists
  if (mapData.before && mapData.after) {
    return (
      <div className="flex gap-4">
        {renderFeatures(mapData.before.features, mapData.before.year)}
        <div className="flex items-center text-muted-foreground">→</div>
        {renderFeatures(mapData.after.features, mapData.after.year)}
      </div>
    );
  }

  // Single map
  if (mapData.features) {
    return renderFeatures(mapData.features);
  }

  return <div className="text-center text-muted-foreground text-sm">Map configuration not recognized</div>;
}

// Mixed Charts Renderer
function MixedChartsRenderer({
  data,
  getColor,
}: {
  data: IELTSChartData;
  getColor: (index: number, color?: string) => string;
}) {
  const charts = data.charts || [];

  if (charts.length === 0) {
    return <div className="text-center text-muted-foreground text-sm">No charts to display</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {charts.map((chart, idx) => (
        <div key={idx} className="border border-border rounded-lg p-3">
          {chart.title && (
            <h4 className="text-sm font-medium text-center mb-2">{chart.title}</h4>
          )}
          {chart.type === 'BAR_CHART' && <BarChartRenderer data={chart} getColor={getColor} />}
          {chart.type === 'LINE_GRAPH' && <LineGraphRenderer data={chart} getColor={getColor} />}
          {chart.type === 'PIE_CHART' && <PieChartRenderer data={chart} getColor={getColor} />}
          {chart.type === 'TABLE' && <TableRenderer data={chart} />}
        </div>
      ))}
    </div>
  );
}

export default IELTSVisualRenderer;
