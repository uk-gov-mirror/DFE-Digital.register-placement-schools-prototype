const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class Region extends Model {
    static associate(models) {
      Region.hasMany(models.SchoolDetail, {
        foreignKey: 'regionCode',
        sourceKey: 'code',
        as: 'schoolDetails'
      })

      Region.belongsTo(models.User, {
        foreignKey: 'createdById',
        as: 'createdByUser'
      })

      Region.belongsTo(models.User, {
        foreignKey: 'updatedById',
        as: 'updatedByUser'
      })
    }
  }

  Region.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      code:  {
        type: DataTypes.STRING,
        allowNull: false
      },
      name:  {
        type: DataTypes.STRING,
        allowNull: false
      },
      ONScode:  {
        type: DataTypes.STRING,
        field: 'ons_code'
      },
      rank:  {
        type: DataTypes.TINYINT
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at'
      },
      createdById: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'created_by_id'
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at'
      },
      updatedById: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'updated_by_id'
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at'
      },
      deletedById: {
        type: DataTypes.UUID,
        field: 'deleted_by_id'
      }
    },
    {
      sequelize,
      modelName: 'Region',
      tableName: 'regions',
      timestamps: true
    }
  )

  // const createRevisionHook = require('../hooks/revisionHook')

  // Region.addHook('afterCreate', (instance, options) =>
  //   createRevisionHook({ revisionModelName: 'RegionRevision', modelKey: 'region' })(instance, {
  //     ...options,
  //     hookName: 'afterCreate'
  //   })
  // )

  // Region.addHook('afterUpdate', (instance, options) => {
  //   const hookName = instance.deletedById !== null ? 'afterDestroy' : 'afterUpdate'
  //   createRevisionHook({ revisionModelName: 'RegionRevision', modelKey: 'region' })(instance, {
  //     ...options,
  //     hookName
  //   })
  // })

  return Region
}
