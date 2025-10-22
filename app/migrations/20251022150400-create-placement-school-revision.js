module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('placement_school_revisions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      placement_school_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'placement_schools',
          key: 'id'
        }
      },
      school_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      provider_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      academic_year_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_by_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_by_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE
      },
      deleted_by_id: {
        type: Sequelize.UUID
      },
      revision_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      revision_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      revision_by_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'The user who made the change'
      }
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('placement_school_revisions')
  }
}
