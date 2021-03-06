import d3 from 'd3';
import { selectObject } from '../index';
import { transition } from '../selection/transition';

let defaultOrient = "bottom";

let axisOrients = {top: 1, right: 1, bottom: 1, left: 1};

// var minValue = 1e-6;

export var axis = function() {
  let scale = d3.scale.linear();
  let orient = defaultOrient;
  let innerTickSize = 6;
  let outerTickSize = 6;
  let tickPadding = 3;
  let tickArguments_ = [10];
  let tickValues = null;
  let tickFormat_;

  function axis(object) {
    object.each(function() {
      var root = selectObject(this);

      let scale0 = this.__scale__ || scale;
      let scale1 = this.__scale__ = scale.copy();

      var ticks, tickFormat;

      if (tickValues === null) {
        ticks = scale1.ticks ? scale1.ticks.apply(scale1, tickArguments_): scale1.domain();
      } else {
        ticks = tickValues;
      }

      if (tickFormat_ === null) {
        tickFormat = scale1.tickFormat ? scale1.tickFormat.apply(scale1, tickArguments_): d => d;
      } else {
        tickFormat = tickFormat_;
      }

      var tick = root.selectAll(".tick")
        .data(ticks, scale1);

      var tickEnter = tick.enter()
        .append("object")
        .attr("tags", "tick");

      var tickExit = tick.exit();
        // .style("opacity", minValue).remove();

      var tickUpdate = tick;
        // .style("opacity", 1);

      var tickSpacing = Math.max(innerTickSize, 0) + tickPadding;
      var tickTransform;

      var range = scaleRange(scale1);

      var path = root.selectAll(".domain").data([0]);

      var pathUpdate = path.enter()
        .append("object")
        .attr("tags", "domain");

      tickEnter.append("object").attr("tags", "line");

      tickEnter.append("object").attr("tags", "text");
      console.log("tick enter", tickEnter);

      var lineEnter = tickEnter.select("line");
      var lineUpdate = tickUpdate.select("line");

      var text = tick.select("text"); //.text(tickFormat);
      var textEnter = tickEnter.select("text");
      var textUpdate = tickUpdate.select("text");

      var sign = orient === "top" || orient === "left" ? -1 : 1;
      var x1, x2, y1, y2;

      if (orient === "bottom" || orient === "top") {
        tickTransform = axisX;
        x1 = "x";
        y1 = "y";
        x2 = "x2";
        y2 = "y2";

        // text.attr("dy", sign < 0 ? "0em" : ".71em").style("text-anchor", "middle");
        // pathUpdate.attr("d", "M" + range[0] + "," + sign * outerTickSize + "V0H" + range[1] + "V" + sign * outerTickSize);

      } else {
        tickTransform = axisY;
        x1 = "y";
        y1 = "x";
        x2 = "y2";
        y2 = "x2";

        // text.attr("dy", ".32em").style("text-anchor", sign < 0 ? "end" : "start");
        // pathUpdate.attr("d", "M" + sign * outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + sign * outerTickSize);
      }

      lineEnter.attr(y2, sign * innerTickSize);
      textEnter.attr(y1, sign * tickSpacing);
      lineUpdate.attr(x2, 0).attr(y2, sign * innerTickSize);
      textUpdate.attr(x1, 0).attr(y1, sign * tickSpacing);

      // If either the new or old scale is ordinal,
      // entering ticks are undefined in the old scale,
      // and so can fade-in in the new scale’s position.
      // Exiting ticks are likewise undefined in the new scale,
      // and so can fade-out in the old scale’s position.
      if (scale1.rangeBand) {
        let x = scale1;
        let dx = x.rangeBand() / 2;

        scale0 = scale1 = function(d) {
          return x(d) + dx;
        };

      } else if (scale0.rangeBand) {
        scale0 = scale1;
      } else {
        tickExit.call(tickTransform, scale1, scale0);
      }

      tickEnter.call(tickTransform, scale0, scale1);
      tickUpdate.call(tickTransform, scale1, scale1);
    });
  }

  axis.scale = function(x) {
    if (!arguments.length) {
      return scale;
    }
    scale = x;
    return axis;
  };

  axis.orient = function(x) {
    if (!arguments.length) {
      return orient;
    }
    orient = x in axisOrients   ? x + "" : defaultOrient;
    return axis;
  };

  axis.ticks = function() {
    if (!arguments.length) {
      return tickArguments_;
    }
    tickArguments_ = arguments;
    return axis;
  };

  axis.tickValues = function(x) {
    if (!arguments.length) {
      return tickValues;
    }
    tickValues = x;
    return axis;
  };

  axis.tickFormat = function(x) {
    if (!arguments.length) {
      return tickFormat_;
    }
    tickFormat_ = x;
    return axis;
  };

  axis.tickSize = function(x) {
    var n = arguments.length;
    if (!n) {
      return innerTickSize;
    }
    innerTickSize = +x;
    outerTickSize = +arguments[n - 1];
    return axis;
  };

  axis.innerTickSize = function(x) {
    if (!arguments.length) {
      return innerTickSize;
    }
    innerTickSize = +x;
    return axis;
  };

  axis.outerTickSize = function(x) {
    if (!arguments.length) {
      return outerTickSize;
    }
    outerTickSize = +x;
    return axis;
  };

  axis.tickPadding = function(x) {
    if (!arguments.length) {
      return tickPadding;
    }
    tickPadding = +x;
    return axis;
  };

  axis.tickSubdivide = function() {
    return arguments.length && axis;
  };

  return axis;
};

function scaleExtent(domain) {
  var start = domain[0], stop = domain[domain.length - 1];
  return start < stop ? [start, stop] : [stop, start];
}

function scaleRange(scale) {
  return scale.rangeExtent ? scale.rangeExtent() : scaleExtent(scale.range());
}

function axisX(selection, x0, x1) {
  selection.attr("transform", function(d) { var v0 = x0(d); return "translate(" + (isFinite(v0) ? v0 : x1(d)) + ",0)"; });
}

function axisY(selection, y0, y1) {
  selection.attr("transform", function(d) { var v0 = y0(d); return "translate(0," + (isFinite(v0) ? v0 : y1(d)) + ")"; });
}
