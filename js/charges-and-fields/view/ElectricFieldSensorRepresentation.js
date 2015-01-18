// Copyright 2002-2015, University of Colorado Boulder

/**
 *  Scenery Node for the electric field sensor node.
 *  The sensor is made of a circle and an arrow that points along the local electric field
 *  and changes its length according to the magnitude of the electric field
 *  A text label of the direction and magnitude of the local electric field is also displayed
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  // constants
  var CIRCLE_RADIUS = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS;

  /**
   * Constructor for the ElectricFieldSensorNode which renders the sensor as a scenery node.
   * @constructor
   */
  function ElectricFieldSensorNode() {

    // Call the super constructor
    Node.call( this, {
      // Show a cursor hand over the charge
      cursor: 'pointer'
    } );

    // Create the centered circle
    var circle = new Circle( CIRCLE_RADIUS, {
      centerX: 0,
      centerY: 0
    } );

    var circleFillColorFunction = function( color ) {
      circle.fill = color;
    };
    ChargesAndFieldsColors.link( 'electricFieldSensorCircleFill', circleFillColorFunction );

    var circleStrokeColorFunction = function( color ) {
      circle.stroke = color;
    };
    ChargesAndFieldsColors.link( 'electricFieldSensorCircleStroke', circleStrokeColorFunction );

    // Rendering order
    this.addChild( circle );

  }

  return inherit( Node, ElectricFieldSensorNode );
} );