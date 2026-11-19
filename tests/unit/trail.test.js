import { expect } from 'chai';
import { buildHeatmap, computeTrailStats, formatTime, markGlitches, parseTrailCsv } from '../../src/lib/trail.js';

describe('parseTrailCsv', () => {
  it('parses time,x,y rows and marks -1,-1 as not visible', () => {
    const points = parseTrailCsv('0.00,10,20\n0.50,-1,-1\n');
    expect(points).to.deep.equal([
      { time: 0, x: 10, y: 20, visible: true },
      { time: 0.5, x: -1, y: -1, visible: false },
    ]);
  });

  it('handles Windows line endings and skips blank or malformed lines', () => {
    const points = parseTrailCsv('0.00,1,2\r\n\r\ntime,x,y\r\nnot,a,row\r\n1.00,3,4');
    expect(points.map((point) => point.time)).to.deep.equal([0, 1]);
  });

  it('returns an empty array for empty input', () => {
    expect(parseTrailCsv('')).to.deep.equal([]);
  });
});

describe('computeTrailStats', () => {
  it('returns zeros for an empty trail', () => {
    const stats = computeTrailStats([]);
    expect(stats.duration).to.equal(0);
    expect(stats.distance).to.equal(0);
    expect(stats.visiblePercent).to.equal(0);
  });

  it('measures distance, top speed, and duration between visible samples', () => {
    const points = parseTrailCsv('0.0,0,0\n0.5,3,4\n1.0,3,4');
    const stats = computeTrailStats(points);
    expect(stats.duration).to.equal(1);
    expect(stats.sampleInterval).to.equal(0.5);
    expect(stats.distance).to.equal(5);
    expect(stats.topSpeed).to.equal(10);
    expect(stats.restingPercent).to.equal(50);
  });

  it('does not count a jump across a gap where the salamander was missing', () => {
    const points = parseTrailCsv('0.0,0,0\n0.5,-1,-1\n1.0,100,0');
    const stats = computeTrailStats(points);
    expect(stats.distance).to.equal(0);
    expect(stats.visiblePercent).to.be.closeTo(66.67, 0.01);
  });

  it('reports the longest stretch of missing samples in seconds', () => {
    const points = parseTrailCsv('0.0,1,1\n0.5,-1,-1\n1.0,-1,-1\n1.5,-1,-1\n2.0,1,1\n2.5,-1,-1');
    expect(computeTrailStats(points).longestGap).to.equal(1.5);
  });

  it('uses the restingSpeed option to decide what counts as resting', () => {
    const points = parseTrailCsv('0.0,0,0\n1.0,4,0');
    expect(computeTrailStats(points).restingPercent).to.equal(100);
    expect(computeTrailStats(points, { restingSpeed: 2 }).restingPercent).to.equal(0);
  });
});

describe('markGlitches', () => {
  // The salamander sits near (40, 590); the tracker jumps to noise at the top edge and back.
  const glitchyCsv = '0.0,40,590\n0.5,41,591\n1.0,250,8\n1.5,260,9\n2.0,42,592\n2.5,43,593';

  it('flags samples between an impossible jump away and the jump back', () => {
    const flags = markGlitches(parseTrailCsv(glitchyCsv)).map((point) => point.glitch);
    expect(flags).to.deep.equal([false, false, true, true, false, false]);
  });

  it('leaves a fast jump alone when it never jumps back', () => {
    const flags = markGlitches(parseTrailCsv('0.0,40,590\n0.5,250,8\n1.0,251,9\n1.5,252,10'));
    expect(flags.every((point) => !point.glitch)).to.equal(true);
  });

  it('does not flag normal slow movement', () => {
    const flags = markGlitches(parseTrailCsv('0.0,0,0\n0.5,10,0\n1.0,20,5\n1.5,25,10'));
    expect(flags.some((point) => point.glitch)).to.equal(false);
  });

  it('skips missing samples when looking for jumps', () => {
    const flags = markGlitches(parseTrailCsv('0.0,40,590\n0.5,-1,-1\n1.0,250,8\n1.5,40,591'));
    expect(flags.map((point) => point.glitch)).to.deep.equal([false, false, true, false]);
  });

  it('keeps glitches out of distance and speed, and counts them separately', () => {
    const stats = computeTrailStats(markGlitches(parseTrailCsv(glitchyCsv)));
    expect(stats.topSpeed).to.be.below(10);
    expect(stats.glitchEpisodes).to.equal(1);
    expect(stats.glitchSeconds).to.equal(1);
    expect(stats.visiblePercent).to.be.closeTo(66.67, 0.01);
  });
});

describe('buildHeatmap', () => {
  it('counts visible samples per grid cell and tracks the busiest cell', () => {
    const points = parseTrailCsv('0,5,5\n1,6,6\n2,15,5\n3,-1,-1');
    const heatmap = buildHeatmap(points, 20, 10, 10);
    expect(heatmap.cols).to.equal(2);
    expect(heatmap.rows).to.equal(1);
    expect(heatmap.counts).to.deep.equal([2, 1]);
    expect(heatmap.max).to.equal(2);
  });

  it('ignores points outside the frame', () => {
    const heatmap = buildHeatmap(parseTrailCsv('0,50,50'), 20, 10, 10);
    expect(heatmap.max).to.equal(0);
  });
});

describe('formatTime', () => {
  it('formats seconds as m:ss', () => {
    expect(formatTime(0)).to.equal('0:00');
    expect(formatTime(65.9)).to.equal('1:05');
    expect(formatTime(478.52)).to.equal('7:58');
  });

  it('adds hours for long videos', () => {
    expect(formatTime(3725)).to.equal('1:02:05');
  });
});
